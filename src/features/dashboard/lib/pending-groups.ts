export type PendingFilter = "all" | "soon" | "late";
export type PendingKind = "card" | "fixed" | "debt" | "collect" | "review";
export type PendingSection = "pay" | "collect" | "review";

export interface PendingEntry {
  id: string;
  kind: PendingKind;
  title: string;
  detail: string;
  amount: number | null;
  dueDate: string | null;
  /** Person of a debt or collection, to group "Por cobrar" by person. */
  person?: string;
  /** Already settled (billed month): it is shown but never counted. */
  paid?: boolean;
  href: string;
  action: string;
}

export const SOON_DAYS = 7;
/** Most items a filtered list shows before "Ver los N". */
export const FILTERED_LIMIT = 6;

export const SECTION_OF: Record<PendingKind, PendingSection> = {
  card: "pay",
  fixed: "pay",
  debt: "pay",
  collect: "collect",
  review: "review",
};

export const KIND_LABELS: Record<PendingKind, string> = {
  card: "Tarjetas",
  fixed: "Costos fijos",
  debt: "Deudas",
  collect: "Cobros",
  review: "Por revisar",
};

/** Days from `today` to `date` (negative = overdue); null without date. */
export function daysUntil(date: string | null, today: Date): number | null {
  if (!date) return null;
  const due = new Date(`${date.slice(0, 10)}T00:00:00`);
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((due.getTime() - base.getTime()) / 86_400_000);
}

export function isLate(entry: PendingEntry, today: Date): boolean {
  const days = daysUntil(entry.dueDate, today);
  return !entry.paid && days != null && days < 0;
}

export function isSoon(entry: PendingEntry, today: Date): boolean {
  const days = daysUntil(entry.dueDate, today);
  return !entry.paid && days != null && days >= 0 && days <= SOON_DAYS;
}

export function pendingCounts(entries: PendingEntry[], today: Date) {
  return {
    all: entries.filter((entry) => !entry.paid).length,
    soon: entries.filter((entry) => isSoon(entry, today)).length,
    late: entries.filter((entry) => isLate(entry, today)).length,
  };
}

export function filterPending(
  entries: PendingEntry[],
  filter: PendingFilter,
  today: Date,
): PendingEntry[] {
  if (filter === "late") return entries.filter((e) => isLate(e, today));
  if (filter === "soon") return entries.filter((e) => isSoon(e, today));
  return entries;
}

/** Most overdue first (late filter) or nearest due date first (soon). */
export function sortByUrgency(
  entries: PendingEntry[],
  today: Date,
): PendingEntry[] {
  const order = (entry: PendingEntry) =>
    daysUntil(entry.dueDate, today) ?? Number.MAX_SAFE_INTEGER;
  return [...entries].sort((a, b) => order(a) - order(b));
}

export function limitList(entries: PendingEntry[], showAll: boolean) {
  const shown = showAll ? entries : entries.slice(0, FILTERED_LIMIT);
  return { shown, hidden: entries.length - shown.length };
}

export interface PendingGroup {
  kind: PendingKind;
  label: string;
  items: PendingEntry[];
  total: number;
  late: number;
  soon: number;
  /** Nearest due date among the pending items, null when none has one. */
  nextDueDate: string | null;
}

const sum = (entries: PendingEntry[]) =>
  entries.reduce((total, entry) => total + (entry.amount ?? 0), 0);

/** Pending (not paid) items of one section grouped by kind, most urgent group first. */
export function groupSection(
  entries: PendingEntry[],
  section: PendingSection,
  today: Date,
): PendingGroup[] {
  const pending = entries.filter(
    (entry) => !entry.paid && SECTION_OF[entry.kind] === section,
  );
  const kinds = [...new Set(pending.map((entry) => entry.kind))];
  return kinds
    .map((kind) => {
      const items = sortByUrgency(
        pending.filter((entry) => entry.kind === kind),
        today,
      );
      return {
        kind,
        label: KIND_LABELS[kind],
        items,
        total: sum(items),
        late: items.filter((entry) => isLate(entry, today)).length,
        soon: items.filter((entry) => isSoon(entry, today)).length,
        nextDueDate: items.find((entry) => entry.dueDate)?.dueDate ?? null,
      };
    })
    .sort((a, b) => {
      const order = (group: PendingGroup) =>
        daysUntil(group.nextDueDate, today) ?? Number.MAX_SAFE_INTEGER;
      return order(a) - order(b);
    });
}

export interface SectionSummary {
  section: PendingSection;
  total: number;
  count: number;
  groups: number;
  people: number;
  withoutAmount: boolean;
}

export function summarizeSection(
  entries: PendingEntry[],
  section: PendingSection,
): SectionSummary {
  const pending = entries.filter(
    (entry) => !entry.paid && SECTION_OF[entry.kind] === section,
  );
  return {
    section,
    total: sum(pending),
    count: pending.length,
    groups: new Set(pending.map((entry) => entry.kind)).size,
    people: new Set(pending.flatMap((entry) => entry.person ?? [])).size,
    withoutAmount: pending.length > 0 && pending.every((e) => e.amount == null),
  };
}

export interface PersonGroup {
  person: string;
  items: PendingEntry[];
  total: number;
  late: number;
  oldestDueDate: string | null;
}

/** "Por cobrar": collections grouped by person, biggest balance first. */
export function groupByPerson(
  entries: PendingEntry[],
  today: Date,
): PersonGroup[] {
  const pending = entries.filter(
    (entry) => !entry.paid && entry.kind === "collect",
  );
  const names = [
    ...new Set(pending.map((entry) => entry.person ?? "Sin nombre")),
  ];
  return names
    .map((person) => {
      const items = pending.filter(
        (entry) => (entry.person ?? "Sin nombre") === person,
      );
      const dated = items
        .map((entry) => entry.dueDate)
        .filter((date): date is string => !!date)
        .sort();
      return {
        person,
        items,
        total: sum(items),
        late: items.filter((entry) => isLate(entry, today)).length,
        oldestDueDate: dated[0] ?? null,
      };
    })
    .sort((a, b) => b.total - a.total);
}

/** "vence en 4 d" / "retrasado 3 d" / "vence hoy" for a due date. */
export function dueLabel(
  date: string | null,
  today: Date,
  words: { late: string; soon: string } = {
    late: "retrasado",
    soon: "vence",
  },
): string | null {
  const days = daysUntil(date, today);
  if (days == null) return null;
  if (days < 0) return `${words.late} ${Math.abs(days)} d`;
  if (days === 0) return `${words.soon} hoy`;
  return `${words.soon} en ${days} d`;
}

export function pluralize(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}
