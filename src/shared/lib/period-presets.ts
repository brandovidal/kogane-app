export type PeriodPresetId = "this-month" | "last-month" | "this-year";

export interface PeriodPresetValue {
  month: string | undefined;
  year: string;
}

export function resolvePeriodPreset(
  id: PeriodPresetId,
  now: Date = new Date(),
): PeriodPresetValue {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  if (id === "this-year") return { month: undefined, year: String(year) };
  if (id === "last-month") {
    return month === 1
      ? { month: "12", year: String(year - 1) }
      : { month: String(month - 1), year: String(year) };
  }
  return { month: String(month), year: String(year) };
}

export function isPeriodPresetActive(
  id: PeriodPresetId,
  month: string | undefined,
  year: string | undefined,
  now: Date = new Date(),
): boolean {
  const target = resolvePeriodPreset(id, now);
  return target.month === month && target.year === year;
}
