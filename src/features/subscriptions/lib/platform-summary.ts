import type { Subscription } from "@/shared/api/types";
import { daysUntilDue } from "@/features/fixed-costs/lib/fixed-cost-summary";
import { paidAndOwn } from "@/features/expenses/lib/shared-expense";

const monthsByPeriod: Record<Subscription["period"], number> = {
  biweekly: 0.5,
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
};

export type PlatformCurrencyTotals = Partial<Record<"PEN" | "USD", number>>;

/** Amount shown on the platform itself, in the currency charged by the provider. */
export const platformNativeAmount = (platform: Subscription) => platform.amount;

export const platformAmount = (platform: Subscription) =>
  paidAndOwn(platform).paid;

export const monthlyEquivalent = (platform: Subscription) =>
  platformNativeAmount(platform) / monthsByPeriod[platform.period];

export function sumPlatformAmounts(
  platforms: Subscription[],
  valueOf: (platform: Subscription) => number = platformNativeAmount,
): PlatformCurrencyTotals {
  return platforms.reduce<PlatformCurrencyTotals>((totals, platform) => {
    const currency = platform.currency === "USD" ? "USD" : "PEN";
    totals[currency] = (totals[currency] ?? 0) + valueOf(platform);
    return totals;
  }, {});
}

export function formatPlatformTotals(totals: PlatformCurrencyTotals): string {
  return (
    (["PEN", "USD"] as const)
      .filter((currency) => totals[currency] != null)
      .map((currency) =>
        formatPlatformCurrency(totals[currency] ?? 0, currency),
      )
      .join(" + ") || "—"
  );
}

export function formatPlatformCurrency(amount: number, currency: string) {
  const number = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return currency === "USD" ? `US$ ${number}` : `S/ ${number}`;
}

/** Keep the original billing day when projecting a recurring charge through short months. */
export function nextPlatformChargeDate(
  platform: Subscription,
  todayKey: string,
): string | null {
  if (!platform.dueDate) return null;
  const base = platform.dueDate.slice(0, 10);
  if (!todayKey || base >= todayKey) return base;
  const [year, month, day] = base.split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return null;
  if (platform.period === "biweekly") {
    const start = Date.UTC(year, month - 1, day);
    const [todayYear, todayMonth, todayDay] = todayKey.split("-").map(Number);
    const today = Date.UTC(todayYear, todayMonth - 1, todayDay);
    return new Date(
      start + Math.ceil((today - start) / (14 * 86_400_000)) * 14 * 86_400_000,
    )
      .toISOString()
      .slice(0, 10);
  }
  const stride = monthsByPeriod[platform.period];
  const [todayYear, todayMonth] = todayKey.split("-").map(Number);
  const baseIndex = year * 12 + month - 1;
  const todayIndex = todayYear * 12 + todayMonth - 1;
  let cycles = Math.max(0, Math.floor((todayIndex - baseIndex) / stride));
  for (;;) {
    const index = baseIndex + cycles * stride;
    const nextYear = Math.floor(index / 12);
    const nextMonth = (index % 12) + 1;
    const lastDay = new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate();
    const candidate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
    if (candidate >= todayKey) return candidate;
    cycles += 1;
  }
}

export function platformChargesInMonth(
  platform: Subscription,
  month: number,
  year: number,
): string[] {
  if (!platform.dueDate) return [];
  const base = platform.dueDate.slice(0, 10);
  const [baseYear, baseMonth, baseDay] = base.split("-").map(Number);
  if (![baseYear, baseMonth, baseDay].every(Number.isFinite)) return [];
  const monthStart = Date.UTC(year, month - 1, 1);
  const monthEnd = Date.UTC(year, month, 1);
  const baseTime = Date.UTC(baseYear, baseMonth - 1, baseDay);
  if (baseTime >= monthEnd) return [];
  if (platform.period === "biweekly") {
    const stride = 14 * 86_400_000;
    const first = Math.max(0, Math.ceil((monthStart - baseTime) / stride));
    const dates: string[] = [];
    for (let cycle = first; baseTime + cycle * stride < monthEnd; cycle += 1) {
      dates.push(
        new Date(baseTime + cycle * stride).toISOString().slice(0, 10),
      );
    }
    return dates;
  }
  const baseIndex = baseYear * 12 + baseMonth - 1;
  const selectedIndex = year * 12 + month - 1;
  const stride = monthsByPeriod[platform.period];
  if (selectedIndex < baseIndex || (selectedIndex - baseIndex) % stride !== 0)
    return [];
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return [
    `${year}-${String(month).padStart(2, "0")}-${String(Math.min(baseDay, lastDay)).padStart(2, "0")}`,
  ];
}

export function summarizePlatforms(
  platforms: Subscription[],
  todayKey: string,
) {
  const monthly = sumPlatformAmounts(platforms, monthlyEquivalent);
  const annual: PlatformCurrencyTotals = {
    PEN: monthly.PEN == null ? undefined : monthly.PEN * 12,
    USD: monthly.USD == null ? undefined : monthly.USD * 12,
  };
  const mostExpensive = [...platforms].sort(
    (left, right) => platformAmount(right) - platformAmount(left),
  )[0];
  const upcoming = platforms
    .map((item) => ({ item, date: nextPlatformChargeDate(item, todayKey) }))
    .filter(
      (entry): entry is { item: Subscription; date: string } => !!entry.date,
    )
    .sort((left, right) => left.date.localeCompare(right.date));
  const nextDue = upcoming[0]?.item;
  const nextDueDate = upcoming[0]?.date ?? null;

  return {
    count: platforms.length,
    monthly,
    annual,
    mostExpensive,
    nextDue,
    nextDueDate,
    nextDueDays:
      nextDueDate && todayKey ? daysUntilDue(nextDueDate, todayKey) : null,
  };
}
