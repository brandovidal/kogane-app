import type { FixedCost } from "@/shared/api/types";
import { PAYMENT_STATUS_GROUPS } from "@/shared/constants/finance";
import { totalsOf } from "@/features/expenses/lib/shared-expense";

export type FixedCostStatusScope = "all" | "payable" | "completed";

const completedStatuses = new Set<string>(PAYMENT_STATUS_GROUPS[2].statuses);
const inProgressStatuses = new Set<string>(PAYMENT_STATUS_GROUPS[1].statuses);

export const isCompletedFixedCost = (cost: FixedCost) =>
  completedStatuses.has(cost.paymentStatus);

export function filterFixedCostsByScope(
  costs: FixedCost[],
  scope: FixedCostStatusScope,
) {
  if (scope === "all") return costs;
  return costs.filter((cost) =>
    scope === "completed" ? isCompletedFixedCost(cost) : !isCompletedFixedCost(cost),
  );
}

export function summarizeFixedCosts(costs: FixedCost[]) {
  const payable = costs.filter((cost) => !isCompletedFixedCost(cost));
  const completed = costs.filter(isCompletedFixedCost);
  const nextDue = payable
    .filter((cost) => cost.dueDate)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))[0];

  return {
    total: totalsOf(costs).paid,
    payable: totalsOf(payable).paid,
    completed: totalsOf(completed).paid,
    totalCount: costs.length,
    payableCount: payable.length,
    completedCount: completed.length,
    notStartedCount: payable.filter((cost) => cost.paymentStatus === "not_started").length,
    inProgressCount: payable.filter((cost) => inProgressStatuses.has(cost.paymentStatus)).length,
    nextDue,
  };
}

export function daysUntilDue(dueDate: string, todayKey: string) {
  const [dueYear, dueMonth, dueDay] = dueDate.slice(0, 10).split("-").map(Number);
  const [year, month, day] = todayKey.split("-").map(Number);
  if (![dueYear, dueMonth, dueDay, year, month, day].every(Number.isFinite)) return null;
  return Math.round(
    (Date.UTC(dueYear, dueMonth - 1, dueDay) - Date.UTC(year, month - 1, day)) / 86_400_000,
  );
}
