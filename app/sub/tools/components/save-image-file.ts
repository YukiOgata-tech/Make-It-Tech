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

export async function saveImageFile(input: SaveImageInput) {
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

  await fallback();
}

export function getBlobDownloadUrl(blob: Blob) {
  return URL.createObjectURL(blob);
}
