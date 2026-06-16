type SaveImageInput = {
  blob: Blob;
  fileName: string;
  title?: string;
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const toFile = ({ blob, fileName }: SaveImageInput) =>
  blob instanceof File && blob.name === fileName
    ? blob
    : new File([blob], fileName, {
        type: blob.type || "image/png",
        lastModified: Date.now(),
      });

export async function saveImageFile(input: SaveImageInput) {
  const file = toFile(input);
  const shareData: ShareData = {
    files: [file],
    title: input.title ?? file.name,
  };

  if (navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  }

  downloadBlob(input.blob, input.fileName);
}

export async function saveImageFiles(
  inputs: SaveImageInput[],
  fallback: () => Promise<void> | void
) {
  if (inputs.length === 1) {
    await saveImageFile(inputs[0]);
    return;
  }

  const files = inputs.map(toFile);
  const shareData: ShareData = {
    files,
    title: "processed-images",
  };

  if (navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  }

  await fallback();
}

export function getBlobDownloadUrl(blob: Blob) {
  return URL.createObjectURL(blob);
}
