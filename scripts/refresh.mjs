/**
 * 本番の再検証を叩く。
 *
 * Firestore を直接書き換えたとき（scripts/publish-article.mjs での入稿や、
 * 記事の手直し）は unstable_cache の再検証が走らないので、この経路で
 * public-blog / public-announcements のタグを落とす。
 *
 * 使い方:
 *   npm run refresh                          本番（lib/site.ts の url）へ
 *   npm run refresh -- http://localhost:3000 別の宛先を指定する場合
 *
 * トークンは .env.local の ADMIN_REVALIDATE_TOKEN を読む。画面には出さない。
 */
import fs from "node:fs";
import process from "node:process";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const token = process.env.ADMIN_REVALIDATE_TOKEN || "";
if (!token) {
  console.error("ADMIN_REVALIDATE_TOKEN が .env.local にありません。");
  process.exit(1);
}

/** 宛先は lib/site.ts の url を既定にして、二重管理にしない。 */
function defaultOrigin() {
  const site = fs.readFileSync("lib/site.ts", "utf8");
  const match = site.match(/url:\s*"([^"]+)"/);
  if (!match) {
    console.error("lib/site.ts から url を読み取れませんでした。");
    process.exit(1);
  }
  return match[1].replace(/\/+$/, "");
}

const origin = (process.argv[2] || defaultOrigin()).replace(/\/+$/, "");
const endpoint = `${origin}/api/admin/refresh`;

console.log(`再検証: ${endpoint}`);

const res = await fetch(endpoint, {
  method: "POST",
  headers: { "x-revalidate-token": token, "content-type": "application/json" },
  body: "{}",
});
const text = await res.text();

console.log(`HTTP ${res.status} ${res.statusText} ${text.slice(0, 200)}`);

if (!res.ok) {
  if (res.status === 401) {
    console.error(
      "認証されませんでした。Vercel 側の ADMIN_REVALIDATE_TOKEN が未設定か、.env.local の値と違います。"
    );
  }
  process.exit(1);
}

console.log("ブログ・お知らせ・sitemap・RSS を再検証しました。");
