// Color condicional de filas ("Colorear la fila cuando…"): reglas simples sobre la fecha de vencimiento
// que se evalúan en orden y gana la primera que coincide. Pura, sin DOM, para poder probarla.

export const ROW_COLORS = ["amber", "red", "green", "blue"] as const;
export type RowColor = (typeof ROW_COLORS)[number];

export const ROW_COLOR_LABELS: Record<RowColor, string> = {
  amber: "Ámbar",
  red: "Rojo",
  green: "Verde",
  blue: "Azul",
};

/** Tailwind classes of each color, soft enough to keep the text readable in both themes. */
export const ROW_COLOR_CLASSES: Record<RowColor, string> = {
  amber: "bg-amber-500/10 hover:bg-amber-500/15",
  red: "bg-red-500/10 hover:bg-red-500/15",
  green: "bg-emerald-500/10 hover:bg-emerald-500/15",
  blue: "bg-sky-500/10 hover:bg-sky-500/15",
};

export type RowColorCondition =
  { type: "overdue" } | { type: "within"; days: number };

export interface RowColorRule {
  id: string;
  when: RowColorCondition;
  /** The rule never applies to rows already in a finished status ("y Estado ≠ Pagado"). */
  skipFinished: boolean;
  color: RowColor;
}

export interface RowColorSubject {
  dueDate?: string | null;
  status?: string | null;
}

export const MAX_WITHIN_DAYS = 90;
const FINISHED_STATUSES = [
  "paid",
  "waived",
  "cashback",
  "amortized",
  "skipped",
];

export const DEFAULT_ROW_COLOR_RULES: RowColorRule[] = [
  {
    id: "within-3",
    when: { type: "within", days: 3 },
    skipFinished: true,
    color: "amber",
  },
  {
    id: "overdue",
    when: { type: "overdue" },
    skipFinished: true,
    color: "red",
  },
];

const dayNumber = (isoDate: string) => {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
};

/** Whole days from today to the due date (negative once it passed); null without a valid date. */
export function daysUntil(
  dueDate: string | null | undefined,
  today: string,
): number | null {
  if (!dueDate || !/^\d{4}-\d{2}-\d{2}/.test(dueDate)) return null;
  return dayNumber(dueDate) - dayNumber(today);
}

export function ruleMatches(
  rule: RowColorRule,
  subject: RowColorSubject,
  today: string,
): boolean {
  if (rule.skipFinished && FINISHED_STATUSES.includes(subject.status ?? ""))
    return false;
  const days = daysUntil(subject.dueDate, today);
  if (days === null) return false;
  return rule.when.type === "overdue"
    ? days < 0
    : days >= 0 && days <= rule.when.days;
}

/** The color of the first rule that matches the row, or undefined. */
export function matchRowColor(
  rules: readonly RowColorRule[],
  subject: RowColorSubject,
  today: string,
): RowColor | undefined {
  return rules.find((rule) => ruleMatches(rule, subject, today))?.color;
}

export function rowColorClass(
  rules: readonly RowColorRule[],
  subject: RowColorSubject,
  today: string,
): string | undefined {
  const color = matchRowColor(rules, subject, today);
  return color ? ROW_COLOR_CLASSES[color] : undefined;
}

export function describeCondition(condition: RowColorCondition): string {
  if (condition.type === "overdue") return "Vencido";
  return condition.days === 0
    ? "Vence hoy"
    : `Vence en ≤ ${condition.days} ${condition.days === 1 ? "día" : "días"}`;
}

const isColor = (value: unknown): value is RowColor =>
  typeof value === "string" &&
  (ROW_COLORS as readonly string[]).includes(value);

/** Reads the rules saved in the browser; anything malformed is dropped, so a bad value never breaks the table. */
export function parseRowColorRules(raw: string | null): RowColorRule[] | null {
  if (raw === null) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(data)) return null;
  const rules: RowColorRule[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const { id, when, skipFinished, color } = item as Record<string, unknown>;
    if (typeof id !== "string" || !isColor(color)) continue;
    const condition = when as Record<string, unknown> | null;
    if (!condition || typeof condition !== "object") continue;
    if (condition.type === "overdue") {
      rules.push({
        id,
        when: { type: "overdue" },
        skipFinished: skipFinished !== false,
        color,
      });
    } else if (
      condition.type === "within" &&
      typeof condition.days === "number" &&
      Number.isInteger(condition.days) &&
      condition.days >= 0 &&
      condition.days <= MAX_WITHIN_DAYS
    ) {
      rules.push({
        id,
        when: { type: "within", days: condition.days },
        skipFinished: skipFinished !== false,
        color,
      });
    }
  }
  return rules;
}
