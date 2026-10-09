import type { ImportSource } from "../types/import-types";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // PDF · hasta 20 MB

const ACCEPT: Record<ImportSource, string[]> = {
  statement: [".pdf"],
  notion: [".zip", ".csv"],
};

export const acceptAttr = (source: ImportSource) => ACCEPT[source].join(",");

const extensionOf = (name: string) =>
  name.includes(".") ? `.${name.split(".").pop()!.toLowerCase()}` : "";

export const fileBadge = (name: string) =>
  extensionOf(name).replace(".", "").toUpperCase().slice(0, 4) || "—";

// Validación del archivo antes de subirlo (board I5): null cuando es válido
export function validateUploadFile(
  file: Pick<File, "name" | "size">,
  source: ImportSource,
): string | null {
  if (!ACCEPT[source].includes(extensionOf(file.name)))
    return source === "statement"
      ? "Formato no compatible · usa un PDF"
      : "Formato no compatible · usa el ZIP o los CSV de Notion";
  if (file.size > MAX_UPLOAD_BYTES) return "El archivo pesa más de 20 MB";
  return null;
}

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Tarjeta detectada por el nombre del archivo («IO-septiembre-2026.pdf» → IO): la más larga que aparece
export function detectCard<T extends { id: string; name: string }>(
  fileName: string,
  cards: T[],
): T | null {
  const tokens = normalize(fileName)
    .replace(/\.[a-z0-9]+$/, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  let best: T | null = null;
  for (const card of cards) {
    const words = normalize(card.name)
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
    if (!words.length) continue;
    const matches = words.every((word) => tokens.includes(word));
    if (matches && (!best || card.name.length > best.name.length)) best = card;
  }
  return best;
}

export const PROCESSING_STEPS = [
  "Leyendo el PDF",
  "Detectando movimientos",
  "Comparando con Kogane",
] as const;

// Progreso estimado mientras la API responde: sube rápido y se detiene en 90 % hasta terminar
export const estimateProgress = (elapsedMs: number, expectedMs = 12000) =>
  Math.min(90, Math.round(90 * (1 - Math.exp((-3 * elapsedMs) / expectedMs))));

export const currentStep = (progress: number) =>
  progress < 35 ? 0 : progress < 70 ? 1 : 2;
