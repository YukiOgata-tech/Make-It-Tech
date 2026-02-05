"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { rehypePlugins, remarkPlugins } from "@/lib/markdown";
import {
  announcementCategories,
  announcementStatuses,
  type AnnouncementCategory,
  type AnnouncementStatus,
} from "@/lib/announcements";

type AnnouncementFormData = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: AnnouncementCategory;
  status: AnnouncementStatus;
  publishedAt?: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  coverImagePath?: string;
  links?: AnnouncementLink[];
};

type AnnouncementEditorProps = {
  id?: string;
  initial?: Partial<AnnouncementFormData>;
};

type AnnouncementLink = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
};

const VIEW_MODES = ["edit", "preview", "split"] as const;
type ViewMode = (typeof VIEW_MODES)[number];
const MAX_COVER_IMAGE_MB = 2;
const MAX_INLINE_IMAGE_MB = 1.2;
const MAX_COVER_IMAGE_PX = 2000;
const MAX_INLINE_IMAGE_PX = 1600;

function normalizeSlug(value: string) {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (base.length > 0) return base;
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6);
  return `news-${stamp}-${random}`;
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

function insertAtCursor(text: string, insert: string, position: number) {
  return text.slice(0, position) + insert + text.slice(position);
}

export function AnnouncementEditor({ id, initial }: AnnouncementEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState<AnnouncementCategory>(
    (initial?.category as AnnouncementCategory) ?? "news"
  );
  const [status, setStatus] = useState<AnnouncementStatus>(
    (initial?.status as AnnouncementStatus) ?? "draft"
  );
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt ? toInputDateTime(initial?.publishedAt) : ""
  );
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [coverImageAlt, setCoverImageAlt] = useState(initial?.coverImageAlt ?? "");
  const [coverImagePath, setCoverImagePath] = useState(initial?.coverImagePath ?? "");
  const [linkItems, setLinkItems] = useState<AnnouncementLink[]>(
    initial?.links ?? []
  );
  const [linkInput, setLinkInput] = useState("");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [uploading, setUploading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const previewContent = useMemo(() => content || "本文はまだ入力されていません。", [content]);

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

  const handleUploadImage = async (file: File, purpose: "cover" | "inline") => {
    setUploading(true);
    setMessage("");
    try {
      const compressedFile = await compressImage(file, purpose);
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("purpose", purpose);
      if (id) {
        formData.append("announcementId", id);
      }
      const response = await fetch("/api/admin/announcements/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "画像のアップロードに失敗しました。");
      }
      const payload = await response.json();
      const url = String(payload?.url ?? "");
      const path = String(payload?.path ?? "");
      if (!url) {
        throw new Error("画像URLを取得できませんでした。");
      }

      if (purpose === "cover") {
        setCoverImageUrl(url);
        setCoverImagePath(path);
        return;
      }

      const snippet = `\n![画像](${url})\n`;
      const element = contentRef.current;
      if (!element) {
        setContent((prev) => `${prev}${snippet}`);
        return;
      }
      const next = insertAtCursor(content, snippet, element.selectionStart);
      setContent(next);
      requestAnimationFrame(() => {
        const cursor = element.selectionStart + snippet.length;
        element.setSelectionRange(cursor, cursor);
        element.focus();
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "画像のアップロードに失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  const handleAddLink = async () => {
    const url = linkInput.trim();
    if (!url) return;
    if (linkItems.some((item) => item.url === url)) {
      setMessage("同じURLが既に追加されています。");
      return;
    }

    setLinkLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/announcements/link-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "リンク情報の取得に失敗しました。");
      }
      const payload = await response.json();
      const link: AnnouncementLink = {
        url,
        title: payload?.title ?? "",
        description: payload?.description ?? "",
        image: payload?.image ?? "",
      };
      setLinkItems((prev) => [...prev, link]);
      setLinkInput("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "リンク情報の取得に失敗しました。");
    } finally {
      setLinkLoading(false);
    }
  };

  const insertLinkToContent = (url: string) => {
    const snippet = `\n${url}\n`;
    const element = contentRef.current;
    if (!element) {
      setContent((prev) => `${prev}${snippet}`);
      return;
    }
    const next = insertAtCursor(content, snippet, element.selectionStart);
    setContent(next);
    requestAnimationFrame(() => {
      const cursor = element.selectionStart + snippet.length;
      element.setSelectionRange(cursor, cursor);
      element.focus();
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage("");

    try {
      const normalizedSlug = normalizeSlug(slug || title);
      setSlug(normalizedSlug);

      const payload = {
        title: title.trim(),
        slug: normalizedSlug,
        summary: summary.trim(),
        content: content.trim(),
        category,
        status,
        publishedAt: status === "published"
          ? (publishedAt || new Date().toISOString())
          : null,
        coverImage: coverImageUrl
          ? {
              url: coverImageUrl,
              alt: coverImageAlt.trim(),
              path: coverImagePath || null,
            }
          : null,
          links: linkItems.map((item) => ({
            url: item.url,
            title: item.title ?? "",
            description: item.description ?? "",
            image: item.image ? item.image : undefined,
          })),
        };

      const response = await fetch(
        id ? `/api/admin/announcements/${id}` : "/api/admin/announcements",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const payloadError = await response.json().catch(() => ({}));
        throw new Error(payloadError?.error ?? "保存に失敗しました。");
      }

      const responsePayload = await response.json().catch(() => ({}));
      const nextId = id ?? responsePayload?.id;

      setMessage("保存しました。");
      if (!id && nextId) {
        router.push(`/sub/admin-console/news/${nextId}`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm("このお知らせを削除しますか？");
    if (!confirmed) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "削除に失敗しました。");
      }
      router.push("/sub/admin-console/news");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "削除に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-border/60 bg-background/70 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">お知らせ編集</p>
            <h1 className="mt-2 text-lg font-semibold sm:text-2xl">
              {id ? "お知らせを編集" : "お知らせを作成"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-xl">
              {status === "published" ? "公開" : "下書き"}
            </Badge>
            {status === "published" && slug ? (
              <a
                href={`/news/${slug}`}
                className="text-xs text-primary underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                公開URL
              </a>
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
          <p className="mt-3 text-xs text-primary">{message}</p>
        ) : null}

        <Separator className="my-4" />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">タイトル</label>
            <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">スラッグ（URL）</label>
            <Input value={slug} onChange={(e) => handleSlugChange(e.target.value)} />
            <p className="text-[11px] text-muted-foreground">
              英数字とハイフン推奨。空の場合は自動生成します。
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm"
              >
                {announcementCategories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">状態</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AnnouncementStatus)}
                className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm"
              >
                {announcementStatuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {status === "published" ? (
            <div className="grid gap-2 sm:max-w-xs">
              <label className="text-xs text-muted-foreground">公開日時</label>
              <Input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>
          ) : null}

          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">要約（一覧表示）</label>
            <Textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="一覧表示用の短い説明を入力"
            />
          </div>

          <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">URLカード（本文内）</p>
              <span className="text-[11px] text-muted-foreground">本文にURL行を挿入するとカード表示</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://example.com"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={handleAddLink}
                disabled={linkLoading}
              >
                {linkLoading ? "取得中..." : "追加"}
              </Button>
            </div>
            {linkItems.length === 0 ? (
              <p className="text-xs text-muted-foreground">まだURLカードがありません。</p>
            ) : (
              <div className="grid gap-2">
                {linkItems.map((item) => (
                  <div
                    key={item.url}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/60 bg-background/80 p-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{item.title || item.url}</p>
                      <p className="text-muted-foreground line-clamp-2">
                        {item.description || item.url}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{item.url}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => insertLinkToContent(item.url)}
                      >
                        本文に挿入
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() =>
                          setLinkItems((prev) => prev.filter((link) => link.url !== item.url))
                        }
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">カバー画像</p>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-primary">
                画像をアップロード
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadImage(file, "cover");
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
                画像が未設定です。アップロード後に一覧で表示されます。
              </p>
            )}
            {uploading ? (
              <p className="text-xs text-muted-foreground">アップロード中...</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs text-muted-foreground">本文（Markdown）</label>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <label className="cursor-pointer text-primary">
                  本文画像をアップロード
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadImage(file, "inline");
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
                <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background px-1 py-0.5">
                  {VIEW_MODES.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setViewMode(mode)}
                      className={cn(
                        "rounded-full px-2 py-1 text-[11px] transition",
                        viewMode === mode
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {mode === "edit" ? "編集" : mode === "preview" ? "プレビュー" : "分割"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={cn(
                "grid gap-3",
                viewMode === "split" ? "md:grid-cols-2" : "grid-cols-1"
              )}
            >
              {(viewMode === "edit" || viewMode === "split") && (
                <textarea
                  ref={contentRef}
                  rows={16}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Markdownで本文を入力してください。"
                  className={cn(
                    "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-background/70 px-3 py-2 text-base shadow-xs backdrop-blur transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    "font-mono text-xs sm:text-sm"
                  )}
                />
              )}

              {(viewMode === "preview" || viewMode === "split") && (
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3 text-sm text-muted-foreground">
                  <div className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl">
                    <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
                      {previewContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
