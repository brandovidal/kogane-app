import { ATTACHMENT_MAX_MB } from "../constants/attachments";

const MAX_BYTES = ATTACHMENT_MAX_MB * 1024 * 1024;

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("No se pudo comprimir la imagen.")),
      "image/jpeg",
      quality,
    );
  });
}

export async function compressImage(file: File): Promise<File> {
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    throw new Error("Este formato no se puede comprimir desde el navegador.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("No se pudo preparar la imagen para comprimirla.");

    let scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    let blob: Blob | undefined;
    for (let resize = 0; resize < 8; resize += 1) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.86, 0.74, 0.62, 0.5, 0.38]) {
        blob = await canvasToBlob(canvas, quality);
        if (blob.size <= MAX_BYTES) {
          const name = file.name.replace(/\.[^.]+$/, "") || "imagen";
          return new File([blob], `${name}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
        }
      }
      scale *= 0.78;
    }
    throw new Error("La imagen sigue superando 15 MB después de comprimirla.");
  } finally {
    bitmap.close();
  }
}
