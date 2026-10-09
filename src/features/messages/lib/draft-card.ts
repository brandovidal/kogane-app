import { chatDayLabel } from "./chat-view";

export interface DraftCard {
  title: string;
  amount: string;
  tags: string[];
  /** Texto del bot antes y después de la tarjeta (HTML del bot, ya sin la tarjeta). */
  before: string;
  after: string;
}

export type ChatActionRole = "save" | "edit" | "draft" | "discard";

const EMPTY = new Set(["", "—", "-", "❓"]);
const strip = (value: string) => value.replace(/<\/?[bi]>/g, "").trim();
const clean = (value: string | undefined) => {
  const text = strip(value ?? "")
    .replace(/❓/g, "")
    .trim();
  return EMPTY.has(text) ? undefined : text;
};

// "26/09/2026" -> "Hoy" / "Ayer" / "26/09/2026"
function dateTag(raw: string, now: Date): string {
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return raw;
  const iso = `${match[3]}-${match[2]}-${match[1]}T12:00:00-05:00`;
  const label = chatDayLabel(iso, now);
  return label === "Hoy" || label === "Ayer" ? label : raw;
}

// El bot resume un borrador como:
//   🧾 <b>Almuerzo</b> — S/ 25.00
//   👤 Brando ❓ 💳 Yape 📂 Comida
//   📅 09/10/2026 · Día a día · Esencial
// Si el texto no tiene ese formato devuelve null y el mensaje se muestra tal cual.
export function parseDraftCard(
  text: string,
  now: Date = new Date(),
): DraftCard | null {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.trimStart().startsWith("🧾"));
  if (start < 0) return null;
  const head = lines[start].match(/🧾\s*(?:<b>)?(.+?)(?:<\/b>)?\s+—\s+(.+)$/);
  if (!head) return null;

  let end = start + 1;
  while (end < lines.length && lines[end].trim() !== "") end++;
  const block = lines.slice(start + 1, end).join(" ");

  const person = clean(block.match(/👤\s*([^💳📂📅]*)/u)?.[1]);
  const method = clean(block.match(/💳\s*([^👤📂📅]*)/u)?.[1]);
  const category = clean(block.match(/📂\s*([^👤💳📅]*)/u)?.[1]);
  const [date, ...rest] = (block.match(/📅\s*(.+)$/u)?.[1] ?? "")
    .split("·")
    .map((part) => strip(part));

  const tags = [
    ...rest.filter(Boolean).slice(0, 1),
    method,
    person,
    category,
    date ? dateTag(date, now) : undefined,
  ].filter((tag): tag is string => Boolean(tag));

  return {
    title: strip(head[1]),
    amount: strip(head[2]),
    tags,
    before: lines.slice(0, start).join("\n").trim(),
    after: lines.slice(end).join("\n").trim(),
  };
}

// Botones del bot que son acciones de la tarjeta; el resto son opciones (chips)
export function actionRole(label: string): ChatActionRole | null {
  const text = label.toLowerCase();
  if (text.includes("guardar")) return "save";
  if (text.includes("editar")) return "edit";
  if (text.includes("borrador")) return "draft";
  if (text.includes("descartar")) return "discard";
  return null;
}

// Quita el emoji inicial de la etiqueta ("✅ Guardar" -> "Guardar")
export function buttonText(label: string): string {
  return label.replace(/^[^\p{L}\p{N}]+/u, "").trim() || label;
}
