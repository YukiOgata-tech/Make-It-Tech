/**
 * ブログ記事の入稿スクリプト。
 *
 * 外部で書いた Markdown と画像を zip（またはフォルダ）で受け取り、検証 → 画像の
 * WebP 正規化 → Firestore への書き込みまでを一度に行う。記事の実体は Firestore の
 * blogPosts にあり、画像だけが public/images/blog/ に置かれる、という本文と画像の
 * 置き場所の違いを吸収するのが目的。
 *
 * 使い方:
 *   node scripts/publish-article.mjs <zipかフォルダのパス> [--dry-run] [--update]
 *
 *   --dry-run  検証だけして、ファイルもFirestoreも書き換えない
 *   --update   同じ slug の既存記事を上書きする（publishedAt は維持）
 *
 * 期待する中身:
 *   article.md      先頭にメタ情報、その後に本文
 *   images/*        本文とカバーで使う画像
 *
 * 書式は docs/blog-authoring.md を参照。
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import nextEnv from "@next/env";
import JSZip from "jszip";
import sharp from "sharp";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const IMAGE_DIR = "public/images/blog";
const PUBLIC_PREFIX = "/images/blog";

// lib/image-upload.ts と同じ規則。管理画面からの入稿と見た目を揃える。
const COVER_WIDTH = 1200;
const COVER_HEIGHT = 630;
const INLINE_MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

// lib/seo.ts の buildMetaDescription が定型文を連結しない下限と、切り詰める上限。
const SUMMARY_MIN = 80;
const SUMMARY_MAX = 160;
// 管理画面API（app/api/admin/blog/route.ts）の制限に合わせる。
const COVER_ALT_MAX = 140;

const RASTER_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const PASSTHROUGH_EXT = new Set([".svg"]);

const problems = [];
const warnings = [];
const fail = (message) => problems.push(message);
const warn = (message) => warnings.push(message);

function parseArgs(argv) {
  const rest = argv.filter((a) => !a.startsWith("--"));
  return {
    source: rest[0],
    dryRun: argv.includes("--dry-run"),
    update: argv.includes("--update"),
  };
}

/** lib/blog.ts のカテゴリ定義を読み、この2箇所がずれないようにする。 */
function readCategories() {
  const src = fs.readFileSync("lib/blog.ts", "utf8");
  const block = src.slice(src.indexOf("blogCategories"), src.indexOf("] as const"));
  return [...block.matchAll(/value:\s*"([a-z]+)"/g)].map((m) => m[1]);
}

/** zip でもフォルダでも、相対パス → Buffer の Map にそろえる。 */
async function loadSource(source) {
  if (!fs.existsSync(source)) {
    console.error(`見つかりません: ${source}`);
    process.exit(1);
  }
  const files = new Map();

  if (fs.statSync(source).isDirectory()) {
    const walk = (dir, prefix = "") => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, rel);
        else files.set(rel, fs.readFileSync(full));
      }
    };
    walk(source);
    return files;
  }

  const zip = await JSZip.loadAsync(fs.readFileSync(source));
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    files.set(name, await entry.async("nodebuffer"));
  }
  return files;
}

/**
 * zip の中身が1階層深いフォルダに入っていることが多いので、共通の接頭辞を外す。
 * 「article.md を含む一番浅い階層」をルートとみなす。
 */
function stripCommonRoot(files) {
  const mdPaths = [...files.keys()].filter((p) => p.toLowerCase().endsWith(".md"));
  if (mdPaths.length === 0) return files;
  const shallowest = mdPaths.sort((a, b) => a.split("/").length - b.split("/").length)[0];
  const root = shallowest.includes("/")
    ? shallowest.slice(0, shallowest.lastIndexOf("/") + 1)
    : "";
  if (!root) return files;

  const stripped = new Map();
  for (const [name, buf] of files) {
    if (name.startsWith(root)) stripped.set(name.slice(root.length), buf);
  }
  return stripped;
}

/** 先頭の --- で囲まれたメタ情報を読む。値は1行、配列はカンマ区切り。 */
function parseFrontMatter(text) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/^﻿/, "");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { meta: null, body: normalized };

  const meta = {};
  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon < 0) continue;
    const key = trimmed.slice(0, colon).trim();
    let value = trimmed.slice(colon + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return { meta, body: normalized.slice(match[0].length).trim() };
}

function parseList(value) {
  if (!value) return [];
  return value
    .replace(/^\[|\]$/g, "")
    .split(/[,、]/)
    .map((v) => v.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

/** 本文が参照している画像の相対パスを、記述順に拾う。 */
function collectBodyImages(body) {
  return [...body.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)]
    .map((m) => m[1].replace(/^\.\//, ""))
    .filter((p) => !p.startsWith("http") && !p.startsWith("/"));
}

/** slug ごとに名前をつけ直す。public/images/blog は全記事で共有の平置きなので。 */
function outputNameFor(slug, relPath, ext) {
  const base = path
    .basename(relPath, path.extname(relPath))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (base === "cover") return `${slug}-cover${ext}`;
  return `${slug}-${base}${ext}`;
}

async function convertImage(buffer, relPath, isCover) {
  const ext = path.extname(relPath).toLowerCase();

  if (PASSTHROUGH_EXT.has(ext)) {
    // 図解SVGはベクターのまま配信する（MarkdownImage が素の img で描画するため）。
    return { buffer, ext: ".svg", note: "SVGはそのまま" };
  }
  if (!RASTER_EXT.has(ext)) {
    return { error: `対応していない拡張子: ${relPath}` };
  }

  const isGif = ext === ".gif";
  const pipeline = sharp(buffer, isGif ? { animated: true } : undefined);
  const meta = await sharp(buffer).metadata();

  // GIF はコマ切り出しで崩れやすいので、カバーでも縮小だけに留める。
  const out =
    isCover && !isGif
      ? await pipeline
          .resize(COVER_WIDTH, COVER_HEIGHT, { fit: "cover", position: "centre" })
          .webp({ quality: WEBP_QUALITY, effort: 6 })
          .toBuffer()
      : await pipeline
          .resize({ width: INLINE_MAX_WIDTH, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY, effort: 6 })
          .toBuffer();

  const after = await sharp(out).metadata();
  return {
    buffer: out,
    ext: ".webp",
    note: `${meta.width}x${meta.height} ${ext.slice(1)} → ${after.width}x${after.height} webp`,
  };
}

async function main() {
  const { source, dryRun, update } = parseArgs(process.argv.slice(2));
  if (!source) {
    console.error("使い方: node scripts/publish-article.mjs <zipかフォルダ> [--dry-run] [--update]");
    process.exit(1);
  }

  nextEnv.loadEnvConfig(process.cwd());
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").split(String.fromCharCode(92) + "n").join("\n"),
    }),
  });
  const db = getFirestore();

  const files = stripCommonRoot(await loadSource(source));
  const mdName = [...files.keys()].find((p) => p.toLowerCase().endsWith(".md"));
  if (!mdName) {
    console.error("Markdown ファイルが見つかりません。");
    process.exit(1);
  }

  const { meta, body } = parseFrontMatter(files.get(mdName).toString("utf8"));
  if (!meta) {
    console.error(`${mdName} の先頭に --- で囲んだメタ情報がありません。`);
    process.exit(1);
  }

  const slug = (meta.slug || "").trim();
  const summary = (meta.summary || "").trim();
  const tags = parseList(meta.tags);
  const status = (meta.status || "published").trim();
  const coverRel = (meta.cover || "").replace(/^\.\//, "").trim();
  const coverAlt = (meta.coverAlt || meta.cover_alt || "").trim();

  // ---- 検証（ここで落ちたら何も書き換えない） ----
  if (!meta.title) fail("title がありません");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) fail(`slug は英小文字・数字・ハイフンのみ: "${slug}"`);
  const categories = readCategories();
  if (!categories.includes(meta.category)) {
    fail(`category が不正: "${meta.category}"（${categories.join(" / ")} のいずれか）`);
  }
  if (summary.length < SUMMARY_MIN || summary.length > SUMMARY_MAX) {
    fail(`summary が ${summary.length}字（${SUMMARY_MIN}〜${SUMMARY_MAX}字にする）`);
  }
  if (!["published", "draft"].includes(status)) fail(`status が不正: "${status}"`);
  if (!coverRel) fail("cover がありません");
  else if (!files.has(coverRel)) fail(`cover のファイルが同梱されていません: ${coverRel}`);
  if (!coverAlt) fail("coverAlt がありません");
  else if (coverAlt.length > COVER_ALT_MAX) fail(`coverAlt が ${coverAlt.length}字（${COVER_ALT_MAX}字以内）`);
  if (tags.length === 0) fail("tags がありません");

  if (/^# /m.test(body)) {
    fail("本文に H1 があります。ページ側が h1 を出すので、本文は ## から始める");
  }
  const h2Count = (body.match(/^## /gm) || []).length;
  if (h2Count < 2) fail(`H2 が ${h2Count}個。2個以上ないと目次が出ない`);

  const bodyImages = [...new Set(collectBodyImages(body))];
  for (const rel of bodyImages) {
    if (!files.has(rel)) fail(`本文が参照している画像が同梱されていません: ${rel}`);
  }
  const used = new Set([coverRel, ...bodyImages]);
  for (const name of files.keys()) {
    if (name === mdName || used.has(name)) continue;
    if (RASTER_EXT.has(path.extname(name).toLowerCase()) || PASSTHROUGH_EXT.has(path.extname(name).toLowerCase())) {
      warn(`使われていない画像: ${name}`);
    }
  }

  const existing = await db.collection("blogPosts").where("slug", "==", slug).limit(1).get();
  if (!existing.empty && !update) {
    fail(`slug "${slug}" は既に存在します。上書きするなら --update をつける`);
  }
  if (existing.empty && update) {
    fail(`slug "${slug}" が見つかりません。--update は既存記事の上書き用`);
  }

  // 内部リンクの宛先が実在するか（記事を消したあとのリンク切れを防ぐ）
  const allPosts = (await db.collection("blogPosts").get()).docs.map((d) => d.data());
  const knownSlugs = new Set(allPosts.map((p) => p.slug));
  for (const m of body.matchAll(/\]\((\/blog\/([a-z0-9-]+))\)/g)) {
    if (!knownSlugs.has(m[2])) fail(`リンク先の記事が存在しません: ${m[1]}`);
  }

  // 関連記事はタグ一致で選ぶので、重なりが無いと無関係な新着で埋まる
  const lower = new Set(tags.map((t) => t.trim().toLowerCase()));
  const overlap = allPosts.some(
    (p) => p.slug !== slug && (p.tags || []).some((t) => lower.has(String(t).trim().toLowerCase()))
  );
  if (!overlap) warn("既存記事と重なるタグがありません。関連記事が新着順で埋まります");

  console.log(`\n${meta.title}`);
  console.log(`  slug     : ${slug}${!existing.empty && update ? "（上書き）" : ""}`);
  console.log(`  category : ${meta.category} / tags: ${tags.join(", ")}`);
  console.log(`  summary  : ${summary.length}字`);
  console.log(`  本文     : ${body.length}字 / H2 ${h2Count}個 / 画像 ${bodyImages.length}枚`);

  if (warnings.length) {
    console.log("\n注意:");
    warnings.forEach((w) => console.log(`  - ${w}`));
  }
  if (problems.length) {
    console.error("\n中止します:");
    problems.forEach((p) => console.error(`  - ${p}`));
    process.exit(1);
  }

  // ---- 画像の変換と配置 ----
  const rewrites = new Map();
  const written = [];
  for (const rel of [coverRel, ...bodyImages]) {
    const result = await convertImage(files.get(rel), rel, rel === coverRel);
    if (result.error) {
      console.error(result.error);
      process.exit(1);
    }
    const outName = outputNameFor(slug, rel, result.ext);
    rewrites.set(rel, `${PUBLIC_PREFIX}/${outName}`);
    written.push({ rel, outName, note: result.note, buffer: result.buffer });
  }

  console.log("\n画像:");
  for (const w of written) {
    console.log(`  ${w.rel} → ${w.outName}  (${w.note}, ${(w.buffer.length / 1024).toFixed(1)}KB)`);
  }

  // 本文の相対パスを公開パスへ置き換える
  let content = body;
  for (const [rel, url] of rewrites) {
    content = content.split(`](${rel}`).join(`](${url}`).split(`](./${rel}`).join(`](${url}`);
  }

  if (dryRun) {
    console.log("\n--dry-run なので、ファイルもFirestoreも書き換えていません。");
    process.exit(0);
  }

  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  for (const w of written) {
    fs.writeFileSync(path.join(IMAGE_DIR, w.outName), w.buffer);
  }

  const now = new Date();
  const record = {
    title: meta.title,
    slug,
    summary,
    content,
    category: meta.category,
    status,
    tags,
    coverImage: { url: rewrites.get(coverRel), alt: coverAlt },
    updatedAt: now,
  };

  if (existing.empty) {
    const ref = await db.collection("blogPosts").add({
      ...record,
      createdAt: now,
      ...(status === "published" ? { publishedAt: now } : {}),
    });
    console.log(`\n登録しました: docId ${ref.id}`);
  } else {
    const doc = existing.docs[0];
    const patch = { ...record };
    // 公開日は動かさない。更新日だけ進める。
    if (status === "published" && !doc.data().publishedAt) patch.publishedAt = now;
    await doc.ref.update(patch);
    console.log(`\n上書きしました: docId ${doc.id}`);
  }

  console.log(`\n次にすること:`);
  console.log(`  1. git add ${IMAGE_DIR} && git commit && git push（画像はリポジトリ管理）`);
  console.log(`  2. デプロイ後に POST /api/admin/refresh（x-revalidate-token）で再検証`);
  console.log(`  → /blog/${slug}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
