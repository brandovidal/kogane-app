import type { BudgetGroupSummary } from "@/features/budget-groups/services/budget-group.service";
import type { CategoryBudgetLine } from "@/features/categories/hooks/category-budgets";
import type { LimitStatus } from "./budget-view";

export interface OverviewCategory {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  spent: number;
  limit: number | null;
  percent: number;
  status: LimitStatus;
  line?: CategoryBudgetLine;
}

export interface OverviewGroup {
  id: string;
  name: string;
  emoji: string;
  percentage: number;
  assigned: number;
  spent: number;
  available: number;
  categories: OverviewCategory[];
}

export interface OverviewTotals {
  limit: number;
  spent: number;
  percent: number;
}

const statusOf = (
  line: CategoryBudgetLine | undefined,
  spent: number,
  limit: number | null,
): LimitStatus => {
  if (line?.status === "over" || line?.status === "warning") return line.status;
  if (limit != null && limit > 0 && spent > limit) return "over";
  return "ok";
};

// Groups with their categories: what each spent against the limit it has (limits come from /v1/category-budgets)
export function buildOverview(
  summaries: BudgetGroupSummary[],
  lines: CategoryBudgetLine[],
): { groups: OverviewGroup[]; totals: OverviewTotals } {
  const groups = summaries.map<OverviewGroup>((summary) => ({
    id: summary.group.id,
    name: summary.group.name,
    emoji: summary.group.emoji,
    percentage: summary.group.percentage,
    assigned: summary.assignedAmount,
    spent: summary.spentAmount,
    available: summary.assignedAmount - summary.spentAmount,
    categories: summary.categories.map<OverviewCategory>((category) => {
      const line = lines.find((item) => item.categoryId === category.id);
      const limit = line?.limit ?? null;
      const spent = line?.spent ?? category.spent;
      return {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        spent,
        limit,
        percent: limit ? Math.round((spent / limit) * 100) : 0,
        status: statusOf(line, spent, limit),
        line,
      };
    }),
  }));
  const limit = groups.reduce((sum, group) => sum + group.assigned, 0);
  const spent = groups.reduce((sum, group) => sum + group.spent, 0);
  return {
    groups,
    totals: {
      limit,
      spent,
      percent: limit ? Math.round((spent / limit) * 100) : 0,
    },
  };
}
