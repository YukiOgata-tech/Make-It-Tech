"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type MyLifeEditorProps = {
  initial?: {
    message?: string;
    imageUrl?: string;
    imagePath?: string;
  };
};

const MAX_IMAGE_MB = 5;

export function MyLifeEditor({ initial }: MyLifeEditorProps) {
  const [message, setMessage] = useState(initial?.message ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [imagePath, setImagePath] = useState(initial?.imagePath ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [tone, setTone] = useState<"info" | "success" | "error">("info");

  const handleUpload = async (file: File) => {
    if (file.size / (1024 * 1024) > MAX_IMAGE_MB) {
      setTone("error");
      setNotice(`画像サイズは${MAX_IMAGE_MB}MB以内にしてください。`);
      return;
    }

    setUploading(true);
    setNotice("");
    setTone("info");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/my-life/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "画像のアップロードに失敗しました。");
      }
      const payload = await response.json();
      setImageUrl(String(payload?.url ?? ""));
      setImagePath(String(payload?.path ?? ""));
      setTone("success");
      setNotice("画像をアップロードしました。");
    } catch (error) {
      setTone("error");
      setNotice(error instanceof Error ? error.message : "画像のアップロードに失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice("");
    setTone("info");
    try {
      const response = await fetch("/api/admin/my-life", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          imageUrl: imageUrl || null,
          imagePath: imagePath || null,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "保存に失敗しました。");
      }
      setTone("success");
      setNotice("保存しました。");
    } catch (error) {
      setTone("error");
      setNotice(error instanceof Error ? error.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-border/60 bg-background/70 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">My Life 設定</p>
            <h1 className="mt-2 text-lg font-semibold sm:text-2xl">
              this-is-my-life 編集
            </h1>
          </div>
          <Button onClick={handleSave} className="rounded-xl" disabled={saving || uploading}>
            {saving ? "保存中..." : "保存する"}
          </Button>
        </div>

        {notice ? (
          <p
            className={cn(
              "mt-3 text-xs",
              tone === "error"
                ? "text-destructive"
                : tone === "success"
                  ? "text-primary"
                  : "text-muted-foreground"
            )}
          >
            {notice}
          </p>
        ) : null}

        <Separator className="my-4" />

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">僕からのメッセージ</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="このページに表示したいメッセージを入力"
            />
            <p className="text-[11px] text-muted-foreground">
              公開ページではテキストをアニメーション表示します。
            </p>
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs text-muted-foreground">表示画像</label>
              <label className="cursor-pointer text-xs text-primary">
                画像をアップロード
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUpload(file);
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {imageUrl ? (
              <div className="grid gap-2">
                <img
                  src={imageUrl}
                  alt="my life image"
                  className="h-48 w-full rounded-2xl object-cover"
                />
                <div className="grid gap-2 sm:grid-cols-[1fr,auto]">
                  <Input value={imageUrl} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setImageUrl("");
                      setImagePath("");
                    }}
                    disabled={uploading}
                  >
                    画像を外す
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">画像は未設定です。</p>
            )}
            {uploading ? (
              <p className="text-xs text-muted-foreground">アップロード中...</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
