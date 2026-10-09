import { formatAttachmentSize } from "./attachment-size";

export type AttachmentKindFilter = "all" | string;

interface SizedFile {
  kind: string;
  sizeBytes: number | null;
}

// Conteo por tipo para los chips «Todos 4 · Boleta 2 · …» (board 14b)
export function kindCounts(files: SizedFile[]): Record<string, number> {
  const counts: Record<string, number> = { all: files.length };
  for (const file of files) counts[file.kind] = (counts[file.kind] ?? 0) + 1;
  return counts;
}

// «4 archivos · 2.7 MB» (boards 14a–14c)
export function attachmentsSummary(files: SizedFile[]): string {
  const noun = files.length === 1 ? "archivo" : "archivos";
  if (!files.length) return `0 ${noun}`;
  const total = files.reduce((sum, file) => sum + (file.sizeBytes ?? 0), 0);
  return `${files.length} ${noun} · ${formatAttachmentSize(total)}`;
}

const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

// «hoy», «ayer», «hace 2 días» y, pasada una semana, «el 2 oct 2026» (board 14b)
export function uploadedLabel(createdAt: string, now = new Date()): string {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "";
  const startOfDay = (date: Date) =>
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.round((startOfDay(now) - startOfDay(created)) / 86_400_000);
  if (days <= 0) return "subido hoy";
  if (days === 1) return "subido ayer";
  if (days < 7) return `hace ${days} días`;
  return `subido el ${created.getDate()} ${MONTHS[created.getMonth()]} ${created.getFullYear()}`;
}
