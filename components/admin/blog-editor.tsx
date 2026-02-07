"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator as EditorSeparator,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  type ImageUploadHandler,
} from "@mdxeditor/editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  blogCategories,
  blogCategoryLabelMap,
  blogStatuses,
  type BlogCategory,
  type BlogStatus,
} from "@/lib/blog";
import { BlogImageDialog } from "@/components/admin/blog-image-dialog";

const MDXEditor = dynamic(() => import("@mdxeditor/editor").then((mod) => mod.MDXEditor), {
  ssr: false,
});

const MAX_COVER_IMAGE_MB = 2;
const MAX_INLINE_IMAGE_MB = 1.2;
const MAX_COVER_IMAGE_PX = 2200;
const MAX_INLINE_IMAGE_PX = 1600;

type BlogFormData = {
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  category?: BlogCategory;
  status: BlogStatus;
  publishedAt?: string;
  tags?: string[];
  coverImageUrl?: string;
  coverImageAlt?: string;
  coverImagePath?: string;
};

type BlogEditorProps = {
  id?: string;
  initial?: Partial<BlogFormData>;
};

function normalizeSlug(value: string) {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (base.length > 0) return base;
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6);
  return `blog-${stamp}-${random}`;
}

function toInputDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function parseTags(value: string) {
  return value
    .split(/[,\n、]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function BlogEditor({ id, initial }: BlogEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState<BlogCategory | "">(
    (initial?.category as BlogCategory) ?? ""
  );
  const [status, setStatus] = useState<BlogStatus>(
    (initial?.status as BlogStatus) ?? "draft"
  );
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt ? toInputDateTime(initial?.publishedAt) : ""
  );
  const [tagsInput, setTagsInput] = useState(
    initial?.tags?.length ? initial?.tags.join(", ") : ""
  );
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [coverImageAlt, setCoverImageAlt] = useState(initial?.coverImageAlt ?? "");
  const [coverImagePath, setCoverImagePath] = useState(initial?.coverImagePath ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "success" | "error">("info");

  const compressImage = async (file: File, purpose: "cover" | "inline") => {
    if (file.type === "image/gif") return file;
    const options = {
      maxSizeMB: purpose === "cover" ? MAX_COVER_IMAGE_MB : MAX_INLINE_IMAGE_MB,
      maxWidthOrHeight: purpose === "cover" ? MAX_COVER_IMAGE_PX : MAX_INLINE_IMAGE_PX,
      useWebWorker: true,
    };
    try {
      const compressed = (await imageCompression(file, options)) as File | Blob;
      if (compressed instanceof File) {
        return compressed;
      }
      return new File([compressed], file.name, { type: compressed.type || file.type });
    } catch (error) {
      console.warn("Image compression failed", error);
      return file;
    }
  };

  const uploadImage = async (file: File, purpose: "cover" | "inline") => {
    const compressedFile = await compressImage(file, purpose);
    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("purpose", purpose);
    if (id) {
      formData.append("postId", id);
    }
    const response = await fetch("/api/admin/blog/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const rawText = await response.text().catch(() => "");
      let payload: { error?: string; details?: string } | null = null;
      try {
        payload = rawText ? JSON.parse(rawText) : null;
      } catch {
        payload = null;
      }
      const reason =
        payload?.error ||
        payload?.details ||
        rawText ||
        `アップロードに失敗しました。(status ${response.status})`;
      throw new Error(reason);
    }
    const payload = await response.json();
    const url = String(payload?.url ?? "");
    const path = String(payload?.path ?? "");
    if (!url) {
      throw new Error("画像URLを取得できませんでした。");
    }
    return { url, path };
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(normalizeSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value);
  };

  const handleCoverUpload = async (file: File) => {
    setUploading(true);
    setMessage("");
    setMessageTone("info");
    try {
      const uploaded = await uploadImage(file, "cover");
      setCoverImageUrl(uploaded.url);
      setCoverImagePath(uploaded.path);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "画像のアップロードに失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  const imageUploadHandler: ImageUploadHandler = async (image) => {
    const uploaded = await uploadImage(image, "inline");
    return uploaded.url;
  };

  const editorPlugins = useMemo(
    () => [
      headingsPlugin({ allowedHeadingLevels: [2, 3, 4] }),
      listsPlugin(),
      quotePlugin(),
      linkPlugin(),
      imagePlugin({ imageUploadHandler, ImageDialog: BlogImageDialog }),
      tablePlugin(),
      thematicBreakPlugin(),
      codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
      codeMirrorPlugin({
        codeBlockLanguages: {
          txt: "Text",
          js: "JavaScript",
          ts: "TypeScript",
          jsx: "JSX",
          tsx: "TSX",
          html: "HTML",
          css: "CSS",
          json: "JSON",
          bash: "Shell",
        },
      }),
      diffSourcePlugin(),
      markdownShortcutPlugin(),
      toolbarPlugin({
        toolbarContents: () => (
          <DiffSourceToggleWrapper>
            <UndoRedo />
            <EditorSeparator />
            <BlockTypeSelect />
            <BoldItalicUnderlineToggles />
            <CodeToggle />
            <ListsToggle />
            <CreateLink />
            <InsertImage />
            <InsertTable />
            <InsertThematicBreak />
          </DiffSourceToggleWrapper>
        ),
      }),
    ],
    [imageUploadHandler]
  );

  const handleSubmit = async () => {
    setSaving(true);
    setMessage("");
    setMessageTone("info");
    try {
      const normalizedSlug = normalizeSlug(slug || title);
      setSlug(normalizedSlug);
      const tags = parseTags(tagsInput);
      const payload = {
        title: title.trim(),
        slug: normalizedSlug,
        summary: summary.trim(),
        content: content.trim(),
        category: category || undefined,
        tags,
        status,
        publishedAt:
          status === "published" ? publishedAt || new Date().toISOString() : null,
        coverImage: coverImageUrl
          ? {
              url: coverImageUrl,
              alt: coverImageAlt.trim(),
              path: coverImagePath || null,
            }
          : null,
      };

      const response = await fetch(
        id ? `/api/admin/blog/${id}` : "/api/admin/blog",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const rawText = await response.text().catch(() => "");
        let payloadError: { error?: string; details?: string } | null = null;
        try {
          payloadError = rawText ? JSON.parse(rawText) : null;
        } catch {
          payloadError = null;
        }
        const reason =
          payloadError?.error ||
          payloadError?.details ||
          rawText ||
          "保存に失敗しました。";
        throw new Error(reason);
      }

      const responsePayload = await response.json().catch(() => ({}));
      const nextId = id ?? responsePayload?.id;
      setMessageTone("success");
      setMessage("保存しました。");
      if (!id && nextId) {
        router.push(`/sub/admin-console/blog/${nextId}`);
      }
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm("このブログ記事を削除しますか？");
    if (!confirmed) return;
    setSaving(true);
    setMessage("");
    setMessageTone("info");
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const rawText = await response.text().catch(() => "");
        let payloadError: { error?: string; details?: string } | null = null;
        try {
          payloadError = rawText ? JSON.parse(rawText) : null;
        } catch {
          payloadError = null;
        }
        const reason =
          payloadError?.error ||
          payloadError?.details ||
          rawText ||
          "削除に失敗しました。";
        throw new Error(reason);
      }
      router.push("/sub/admin-console/blog");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "削除に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const contentEmpty = !content.trim();

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-border/60 bg-background/70 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">ブログ編集</p>
            <h1 className="text-lg font-semibold sm:text-xl">
              {title || "新規ブログ記事"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-xl">
              {status === "published" ? "公開" : "下書き"}
            </Badge>
            {id ? (
              <Button
                asChild
                variant="outline"
                className="rounded-xl"
              >
                <a href={`/blog/${slug}`} target="_blank" rel="noreferrer">
                  公開ページ
                </a>
              </Button>
            ) : null}
            <Button onClick={handleSubmit} className="rounded-xl" disabled={saving}>
              {saving ? "保存中..." : "保存する"}
            </Button>
            {id ? (
              <Button
                onClick={handleDelete}
                variant="outline"
                className="rounded-xl"
                disabled={saving}
              >
                削除
              </Button>
            ) : null}
          </div>
        </div>

        {message ? (
          <p
            className={cn(
              "mt-3 text-xs",
              messageTone === "error"
                ? "text-destructive"
                : messageTone === "success"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {message}
          </p>
        ) : null}

        <Separator className="my-4" />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">タイトル</label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="記事のタイトル"
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr,220px]">
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">スラッグ</label>
              <Input
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="blog-post-slug"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BlogCategory)}
                className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm"
              >
                <option value="">未設定</option>
                {blogCategories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr,220px]">
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">タグ（カンマ区切り）</label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="DX, 業務改善, 補助金"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">公開状態</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BlogStatus)}
                className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm"
              >
                {blogStatuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr,220px]">
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">概要（任意）</label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="記事の要約や導入文"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">公開日時</label>
              <Input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                未入力なら保存時の日時で公開されます。
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs text-muted-foreground">カバー画像</label>
              <label className="cursor-pointer text-xs text-primary">
                画像をアップロード
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleCoverUpload(file);
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            {coverImageUrl ? (
              <div className="grid gap-2">
                <img
                  src={coverImageUrl}
                  alt={coverImageAlt || "cover"}
                  className="h-40 w-full rounded-2xl object-cover"
                />
                <div className="grid gap-2 sm:grid-cols-[1fr,auto]">
                  <Input
                    value={coverImageAlt}
                    onChange={(e) => setCoverImageAlt(e.target.value)}
                    placeholder="代替テキスト"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setCoverImageUrl("");
                      setCoverImageAlt("");
                      setCoverImagePath("");
                    }}
                  >
                    画像を外す
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                サムネイルやOGP用に画像を設定できます。
              </p>
            )}
            {uploading ? (
              <p className="text-xs text-muted-foreground">アップロード中...</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">本文（Markdown/MDX）</label>
            <div className="rounded-2xl border border-border/60 bg-background">
              <MDXEditor
                markdown={content}
                onChange={setContent}
                plugins={editorPlugins}
                placeholder="本文を入力してください"
                className="prose prose-sm max-w-none px-4 py-3 text-foreground [&_.mdxeditor-root-contenteditable]:min-h-[260px]"
              />
            </div>
            {contentEmpty ? (
              <p className="text-xs text-muted-foreground">
                見出しや箇条書き、画像、表なども挿入できます。
              </p>
            ) : null}
          </div>

          <div className="grid gap-2 rounded-2xl border border-border/60 bg-secondary/20 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">プレビューのヒント</p>
            <ul className="grid gap-1">
              <li>・公開ページでは自動で見出しアンカーやコード装飾が付きます。</li>
              <li>・URLは自動リンク化され、共有用のOGP画像に反映されます。</li>
              <li>・本文画像は挿入時にサイズ/配置を選べます。</li>
              <li>・下書きは公開ページに表示されません。</li>
            </ul>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="article-link article-link--internal">内部リンク（/services など）</span>
              <span className="article-link article-link--external">外部リンク（https://...）</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              内部リンクは相対URLを使うと色分けが正確になります。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              {category
                ? `カテゴリ: ${blogCategoryLabelMap[category] ?? "未設定"}`
                : "カテゴリ: 未設定"}
            </span>
            <span>タグ: {parseTags(tagsInput).length ? parseTags(tagsInput).join(" / ") : "なし"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
