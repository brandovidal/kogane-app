export type PeriodStatus = "current" | "billed" | "future";

/** Where a month stands against today: in progress, already closed or still to come. */
export function periodStatus(
  month: number,
  year: number,
  now: Date = new Date(),
): PeriodStatus {
  const selected = year * 12 + month;
  const current = now.getFullYear() * 12 + now.getMonth() + 1;
  if (selected === current) return "current";
  return selected < current ? "billed" : "future";
}
