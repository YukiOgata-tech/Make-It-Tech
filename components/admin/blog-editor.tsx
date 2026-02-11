"use client";

import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
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
import { MarkdownImage } from "@/components/content/markdown-image";
import { MarkdownLink } from "@/components/content/markdown-link";
import { MarkdownTable } from "@/components/content/markdown-table";
import { rehypePlugins, remarkPlugins } from "@/lib/markdown";
import { buildHeadingSequence } from "@/lib/markdown-toc";
import { cn } from "@/lib/utils";
import {
  blogCategories,
  blogCategoryLabelMap,
  blogStatuses,
  type BlogCategory,
  type BlogStatus,
} from "@/lib/blog";
import { BlogImageDialog } from "@/components/admin/blog-image-dialog";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

const MDXEditor = dynamic(() => import("@mdxeditor/editor").then((mod) => mod.MDXEditor), {
  ssr: false,
});

const MAX_COVER_IMAGE_MB = 2;
const MAX_INLINE_IMAGE_MB = 1.2;
const MAX_COVER_IMAGE_PX = 2200;
const MAX_INLINE_IMAGE_PX = 1600;
const VIEW_MODES = ["edit", "preview", "split"] as const;
type ViewMode = (typeof VIEW_MODES)[number];
const COVER_PRESETS = [
  { label: "幅1200", width: 1200 },
  { label: "幅1600", width: 1600 },
  { label: "幅1920", width: 1920 },
  { label: "OGP 1200×630", width: 1200, height: 630, keepAspect: false },
] as const;

type CoverPending = {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
};

type FitMode = "contain" | "cover" | "stretch";

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

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    img.src = url;
  });
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
  const [coverPending, setCoverPending] = useState<CoverPending | null>(null);
  const [coverResizeWidth, setCoverResizeWidth] = useState(1200);
  const [coverResizeHeight, setCoverResizeHeight] = useState(630);
  const [coverMaintainAspect, setCoverMaintainAspect] = useState(true);
  const [coverFitMode, setCoverFitMode] = useState<FitMode>("cover");
  const [coverOriginalAspect, setCoverOriginalAspect] = useState(16 / 9);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "success" | "error">("info");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const coverCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const previewContent = useMemo(
    () => content || "本文はまだ入力されていません。",
    [content]
  );
  const headingSequence = useMemo(
    () => buildHeadingSequence(previewContent),
    [previewContent]
  );
  const blogRehypePlugins = useMemo(
    () =>
      rehypePlugins.filter((plugin) => {
        if (plugin === rehypeSlug) return false;
        if (Array.isArray(plugin) && plugin[0] === rehypeAutolinkHeadings) return false;
        return true;
      }),
    []
  );

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

  const resetCoverPending = () => {
    if (coverPending?.previewUrl) {
      URL.revokeObjectURL(coverPending.previewUrl);
    }
    setCoverPending(null);
  };

  const clampCoverSize = (value: number) =>
    Math.max(1, Math.min(value, MAX_COVER_IMAGE_PX));

  const handleCoverResizeWidthChange = (value: number) => {
    const next = clampCoverSize(value);
    setCoverResizeWidth(next);
    if (coverMaintainAspect) {
      setCoverResizeHeight(
        clampCoverSize(Math.round(next / coverOriginalAspect))
      );
    }
  };

  const handleCoverResizeHeightChange = (value: number) => {
    const next = clampCoverSize(value);
    setCoverResizeHeight(next);
    if (coverMaintainAspect) {
      setCoverResizeWidth(
        clampCoverSize(Math.round(next * coverOriginalAspect))
      );
    }
  };

  const handleCoverAspectToggle = (next: boolean) => {
    setCoverMaintainAspect(next);
    if (next) {
      setCoverResizeHeight(
        clampCoverSize(Math.round(coverResizeWidth / coverOriginalAspect))
      );
    }
  };

  const handleCoverSelect = async (file: File) => {
    setMessage("");
    setMessageTone("info");
    try {
      const img = await loadImage(file);
      const previewUrl = URL.createObjectURL(file);
      if (coverPending?.previewUrl) {
        URL.revokeObjectURL(coverPending.previewUrl);
      }
      const aspect = img.width / img.height || 1;
      const defaultWidth = Math.min(img.width, 1200, MAX_COVER_IMAGE_PX);
      setCoverPending({
        file,
        previewUrl,
        width: img.width,
        height: img.height,
      });
      setCoverOriginalAspect(aspect);
      setCoverMaintainAspect(true);
      setCoverFitMode("cover");
      setCoverResizeWidth(clampCoverSize(defaultWidth));
      setCoverResizeHeight(
        clampCoverSize(Math.max(1, Math.round(defaultWidth / aspect)))
      );
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "画像の読み込みに失敗しました。");
    }
  };

  const applyCoverPreset = (preset: (typeof COVER_PRESETS)[number]) => {
    if ("keepAspect" in preset && preset.keepAspect === false && "height" in preset) {
      setCoverMaintainAspect(false);
      setCoverResizeWidth(clampCoverSize(preset.width));
      setCoverResizeHeight(clampCoverSize(preset.height));
      setCoverFitMode("cover");
      return;
    }
    handleCoverResizeWidthChange(preset.width);
  };

  const resizeCoverFile = async (file: File) => {
    const img = await loadImage(file);
    const canvas = coverCanvasRef.current;
    if (!canvas) return file;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    const width = Math.max(1, Math.round(coverResizeWidth));
    const height = Math.max(1, Math.round(coverResizeHeight));
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (file.type === "image/png") {
      ctx.clearRect(0, 0, width, height);
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
    }

    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (coverFitMode === "contain") {
      const scale = Math.min(width / img.width, height / img.height);
      drawWidth = img.width * scale;
      drawHeight = img.height * scale;
      offsetX = (width - drawWidth) / 2;
      offsetY = (height - drawHeight) / 2;
    } else if (coverFitMode === "cover") {
      const scale = Math.max(width / img.width, height / img.height);
      drawWidth = img.width * scale;
      drawHeight = img.height * scale;
      offsetX = (width - drawWidth) / 2;
      offsetY = (height - drawHeight) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("Resize failed"));
        },
        mimeType,
        0.92
      );
    });

    return new File([blob], file.name, { type: mimeType });
  };

  const handleCoverUploadOriginal = async () => {
    if (!coverPending) return;
    setUploading(true);
    setMessage("");
    setMessageTone("info");
    try {
      const uploaded = await uploadImage(coverPending.file, "cover");
      setCoverImageUrl(uploaded.url);
      setCoverImagePath(uploaded.path);
      resetCoverPending();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "画像のアップロードに失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUploadResized = async () => {
    if (!coverPending) return;
    setUploading(true);
    setMessage("");
    setMessageTone("info");
    try {
      const resized = await resizeCoverFile(coverPending.file);
      const uploaded = await uploadImage(resized, "cover");
      setCoverImageUrl(uploaded.url);
      setCoverImagePath(uploaded.path);
      resetCoverPending();
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
  let headingIndex = 0;
  const nextHeadingId = () => {
    const entry = headingSequence[headingIndex];
    headingIndex += 1;
    return entry?.id;
  };

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
                      handleCoverSelect(file);
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            {coverPending ? (
              <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">リサイズ設定</p>
                  <span className="text-[11px] text-muted-foreground">
                    最大 {MAX_COVER_IMAGE_PX}px
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-[160px,1fr]">
                  <img
                    src={coverPending.previewUrl}
                    alt="cover preview"
                    className="h-32 w-full rounded-xl object-cover"
                  />
                  <div className="grid gap-3">
                    <div className="flex flex-wrap gap-2">
                      {COVER_PRESETS.map((preset) => (
                        <Button
                          key={preset.label}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => applyCoverPreset(preset)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">幅</span>
                        <Input
                          type="number"
                          value={coverResizeWidth}
                          onChange={(e) =>
                            handleCoverResizeWidthChange(Number(e.target.value))
                          }
                          min={1}
                          max={MAX_COVER_IMAGE_PX}
                          className="h-8 w-24"
                        />
                        <span className="text-muted-foreground">px</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">高さ</span>
                        <Input
                          type="number"
                          value={coverResizeHeight}
                          onChange={(e) =>
                            handleCoverResizeHeightChange(Number(e.target.value))
                          }
                          min={1}
                          max={MAX_COVER_IMAGE_PX}
                          className="h-8 w-24"
                        />
                        <span className="text-muted-foreground">px</span>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={coverMaintainAspect}
                          onChange={(e) => handleCoverAspectToggle(e.target.checked)}
                          className="accent-primary"
                        />
                        縦横比を維持
                      </label>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-muted-foreground">フィット</span>
                      {(["contain", "cover", "stretch"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setCoverFitMode(mode)}
                          className={cn(
                            "rounded-full border px-2 py-1 transition",
                            coverFitMode === mode
                              ? "border-primary/60 bg-primary text-primary-foreground"
                              : "border-border/60 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {mode === "contain"
                            ? "収める"
                            : mode === "cover"
                              ? "覆う"
                              : "伸ばす"}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      元サイズ: {coverPending.width}×{coverPending.height}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-xl"
                        onClick={handleCoverUploadResized}
                        disabled={uploading}
                      >
                        リサイズしてアップロード
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={handleCoverUploadOriginal}
                        disabled={uploading}
                      >
                        そのままアップロード
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                        onClick={resetCoverPending}
                        disabled={uploading}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </div>
                </div>
                <canvas ref={coverCanvasRef} className="hidden" />
              </div>
            ) : null}
            {!coverPending && coverImageUrl ? (
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
            ) : null}
            {!coverPending && !coverImageUrl ? (
              <p className="text-xs text-muted-foreground">
                サムネイルやOGP用に画像を設定できます。
              </p>
            ) : null}
            {uploading ? (
              <p className="text-xs text-muted-foreground">アップロード中...</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs text-muted-foreground">本文（Markdown/MDX）</label>
              <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background px-1 py-0.5 text-xs">
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
            <div
              className={cn(
                "grid gap-3",
                viewMode === "split" ? "lg:grid-cols-2" : "grid-cols-1"
              )}
            >
              {(viewMode === "edit" || viewMode === "split") && (
                <div className="rounded-2xl border border-border/60 bg-card/60 shadow-sm focus-within:border-border focus-within:ring-1 focus-within:ring-border/60">
                  <MDXEditor
                    markdown={content}
                    onChange={setContent}
                    plugins={editorPlugins}
                    placeholder="本文を入力してください"
                    className="prose prose-sm prose-invert max-w-none px-4 py-3 text-foreground [&_.mdxeditor-root]:text-foreground [&_.mdxeditor-root-contenteditable]:min-h-[260px] [&_.mdxeditor-root-contenteditable]:text-foreground [&_.mdxeditor-root-contenteditable]:bg-transparent [&_.mdxeditor-root-contenteditable]:outline-none"
                  />
                </div>
              )}
              {(viewMode === "preview" || viewMode === "split") && (
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3 text-sm text-muted-foreground">
                  <div className="article-prose prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-4 prose-a:decoration-primary/50 hover:prose-a:decoration-primary prose-img:rounded-2xl sm:prose-lg">
                    <ReactMarkdown
                      remarkPlugins={remarkPlugins}
                      rehypePlugins={blogRehypePlugins}
                      components={{
                        img: MarkdownImage,
                        a: MarkdownLink,
                        table: MarkdownTable,
                        h1({ children, ...props }) {
                          const id = nextHeadingId();
                          return (
                            <h1 id={id ?? props.id} {...props}>
                              {children}
                            </h1>
                          );
                        },
                        h2({ children, ...props }) {
                          const id = nextHeadingId();
                          return (
                            <h2 id={id ?? props.id} {...props}>
                              {children}
                            </h2>
                          );
                        },
                        h3({ children, ...props }) {
                          const id = nextHeadingId();
                          return (
                            <h3 id={id ?? props.id} {...props}>
                              {children}
                            </h3>
                          );
                        },
                        h4({ children, ...props }) {
                          const id = nextHeadingId();
                          return (
                            <h4 id={id ?? props.id} {...props}>
                              {children}
                            </h4>
                          );
                        },
                        p({ children }) {
                          const nodes = React.Children.toArray(children).filter((node) => {
                            if (typeof node === "string") {
                              return node.trim().length > 0;
                            }
                            return true;
                          });
                          if (
                            nodes.length === 1 &&
                            React.isValidElement(nodes[0]) &&
                            nodes[0].type === MarkdownImage
                          ) {
                            return <>{nodes[0]}</>;
                          }
                          return <p>{children}</p>;
                        },
                      }}
                    >
                      {previewContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
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
