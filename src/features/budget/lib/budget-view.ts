import type { Summary } from "@/shared/api/types";

// Presupuesto en la web (D78): the data of the charts comes from GET /v1/summary, already counted as yours (D71, D73)

export type DonutMode = "categories" | "groups";

export interface DonutSlice {
  key: string; // category or group id ("none": without category)
  name: string;
  value: number;
  fill: string;
}

// Group colors come from the theme, so they read in light and dark mode
const GROUP_FILLS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function donutSlices(summary: Summary | undefined, mode: DonutMode): DonutSlice[] {
  if (!summary) return [];
  if (mode === "groups") {
    return summary.budgetGroups
      .filter((group) => group.spent > 0)
      .map((group, index) => ({
        key: group.id,
        name: `${group.emoji} ${group.name}`,
        value: group.spent,
        fill: GROUP_FILLS[index % GROUP_FILLS.length],
      }));
  }
  return summary.byCategory
    .filter((line) => line.spent > 0)
    .map((line) => ({ key: line.categoryId ?? "none", name: line.name, value: line.spent, fill: line.color }));
}

export type LimitStatus = "ok" | "warning" | "over";

// Bar of each category: normal, amber from the alert threshold, red from 100 %
export const STATUS_BAR: Record<LimitStatus, string> = {
  ok: "bg-[var(--chart-2)]",
  warning: "bg-amber-500",
  over: "bg-destructive",
};

export const STATUS_TEXT: Record<LimitStatus, string> = {
  ok: "text-muted-foreground",
  warning: "text-amber-600 dark:text-amber-400",
  over: "text-destructive",
};

// Income of the month: salary (or the proposed one) + extras in soles
export function incomeOf(summary: Summary | undefined) {
  const salary = summary?.budget?.salary ?? 0;
  const extra = summary?.extraIncome ?? 0;
  return { salary, extra, total: Math.round((salary + extra) * 100) / 100 };
}

// % of the limit already spent (the limit is salary × limitPercent)
export function limitUsage(summary: Summary | undefined): number | null {
  const limit = summary?.budget?.limit;
  return limit ? Math.round(((summary?.spentPen ?? 0) / limit) * 100) : null;
}
