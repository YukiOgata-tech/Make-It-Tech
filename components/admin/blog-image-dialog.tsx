"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  closeImageDialog$,
  editorRootElementRef$,
  imageDialogState$,
  imageUploadHandler$,
  saveImage$,
} from "@mdxeditor/editor";
import { useCellValues, usePublisher } from "@mdxeditor/gurx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  buildImagePresetTitle,
  getImagePresetKey,
  imagePresetOptions,
  type ImagePresetKey,
} from "@/lib/markdown-image";

const emptyPreset: ImagePresetKey = "full-center";

export function BlogImageDialog() {
  const [state, imageUploadHandler, editorRootElementRef] = useCellValues(
    imageDialogState$,
    imageUploadHandler$,
    editorRootElementRef$
  );
  const saveImage = usePublisher(saveImage$);
  const closeImageDialog = usePublisher(closeImageDialog$);
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");
  const [preset, setPreset] = useState<ImagePresetKey>(emptyPreset);
  const [fileList, setFileList] = useState<FileList | null>(null);
  const [error, setError] = useState("");

  const resetForm = () => {
    setSrc("");
    setAltText("");
    setPreset(emptyPreset);
    setFileList(null);
    setError("");
  };

  useEffect(() => {
    if (state.type === "editing") {
      setSrc(state.initialValues.src ?? "");
      setAltText(state.initialValues.altText ?? "");
      setPreset(getImagePresetKey(state.initialValues.title));
      setFileList(null);
      setError("");
      return;
    }
    if (state.type === "new") {
      resetForm();
    }
  }, [state]);

  if (state.type === "inactive") {
    return null;
  }

  const handleClose = () => {
    closeImageDialog();
    resetForm();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setError("");
    if (!src && !(fileList && fileList.length > 0)) {
      setError("画像ファイルかURLを入力してください。");
      return;
    }

    saveImage({
      src: src || undefined,
      altText: altText || undefined,
      title: buildImagePresetTitle(preset),
      file: fileList ?? undefined,
    });
    resetForm();
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal container={editorRootElementRef?.current ?? undefined}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border",
            "border-border/70 bg-background p-5 shadow-xl"
          )}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Dialog.Title className="text-sm font-semibold">画像を挿入</Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-3 text-sm">
            {imageUploadHandler ? (
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground">画像ファイル</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-xs text-muted-foreground"
                  onChange={(event) => {
                    setFileList(event.target.files);
                  }}
                />
              </div>
            ) : null}

            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">画像URL（任意）</label>
              <Input
                value={src}
                onChange={(event) => setSrc(event.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">代替テキスト</label>
              <Input
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
                placeholder="画像の説明"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">表示サイズ・配置</label>
              <select
                value={preset}
                onChange={(event) => setPreset(event.target.value as ImagePresetKey)}
                className="h-10 rounded-xl border border-border/70 bg-background px-3 text-sm"
              >
                {imagePresetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {error ? <p className="text-xs text-destructive">{error}</p> : null}

            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                キャンセル
              </Button>
              <Button type="submit">挿入する</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
