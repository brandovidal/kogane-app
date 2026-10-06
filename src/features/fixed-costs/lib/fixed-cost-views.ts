import type { FixedCost } from "@/shared/api/types";
import { getMonthName } from "@/shared/lib/dates";
import { daysUntilDue, isCompletedFixedCost } from "./fixed-cost-summary";

export const FIXED_COST_VIEWS = [
  { value: "mes", label: "Mes actual" },
  { value: "por-pagar", label: "Por pagar" },
  { value: "cuotas", label: "Cuotas" },
  { value: "estado", label: "Por estado" },
  { value: "todos", label: "Todos" },
] as const;

export type FixedCostView = (typeof FIXED_COST_VIEWS)[number]["value"];

export const isFixedCostView = (value: unknown): value is FixedCostView =>
  FIXED_COST_VIEWS.some((view) => view.value === value);

export const FIXED_COST_VIEW_PERIOD: Record<FixedCostView, "month" | "year"> = {
  mes: "month",
  estado: "month",
  todos: "year",
  "por-pagar": "month",
  cuotas: "month",
};

export function monthKeyIndex(value: string | undefined) {
  const match = /^(\d{4})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return year * 12 + month - 1;
}

export const monthIndexKey = (index: number) =>
  `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;

export const monthIndexLabel = (index: number) =>
  `${getMonthName((index % 12) + 1).slice(0, 3)} ${Math.floor(index / 12)}`;

export const costMonthIndex = (
  cost: Pick<FixedCost, "paymentMonth" | "paymentYear">,
) => cost.paymentYear * 12 + cost.paymentMonth - 1;

export function filterByMonthRange(
  costs: FixedCost[],
  from?: string,
  to?: string,
) {
  const start = monthKeyIndex(from);
  const end = monthKeyIndex(to);
  if (start == null && end == null) return costs;
  return costs.filter((cost) => {
    const index = costMonthIndex(cost);
    return (start == null || index >= start) && (end == null || index <= end);
  });
}

export function monthRangeLabel(from?: string, to?: string) {
  const start = monthKeyIndex(from);
  const end = monthKeyIndex(to);
  if (start != null && end != null) {
    if (Math.floor(start / 12) === Math.floor(end / 12))
      return `${getMonthName((start % 12) + 1).slice(0, 3)} – ${monthIndexLabel(end)}`;
    return `${monthIndexLabel(start)} – ${monthIndexLabel(end)}`;
  }
  if (start != null) return `Desde ${monthIndexLabel(start)}`;
  if (end != null) return `Hasta ${monthIndexLabel(end)}`;
  return "Rango";
}

export const FIXED_COST_SORTS = [
  {
    value: "vencimiento",
    label: "Vencimiento: más próximo",
    column: "due",
    desc: false,
  },
  {
    value: "-vencimiento",
    label: "Vencimiento: más lejano",
    column: "due",
    desc: true,
  },
  {
    value: "-monto",
    label: "Monto: mayor a menor",
    column: "amount",
    desc: true,
  },
  {
    value: "monto",
    label: "Monto: menor a mayor",
    column: "amount",
    desc: false,
  },
  {
    value: "descripcion",
    label: "Descripción: A → Z",
    column: "description",
    desc: false,
  },
] as const;

export type FixedCostSort = (typeof FIXED_COST_SORTS)[number]["value"];

export const findFixedCostSort = (value: string | undefined) =>
  FIXED_COST_SORTS.find((sort) => sort.value === value);

export function parseInstallment(installment: string | null | undefined) {
  const match = /^(\d{1,3})\/(\d{1,3})$/.exec(installment?.trim() ?? "");
  if (!match) return null;
  const current = Number(match[1]);
  const total = Number(match[2]);
  if (total < 2 || current < 1 || current > total) return null;
  return { current, total, percent: Math.round((current / total) * 100) };
}

export const URGENCY_GROUPS = [
  { value: "overdue", label: "Vencidos" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Próximos 30 días" },
  { value: "later", label: "Después" },
  { value: "undated", label: "Sin fecha de vencimiento" },
] as const;

export type UrgencyGroup = (typeof URGENCY_GROUPS)[number]["value"];

export function urgencyDotColor(group: string) {
  switch (group) {
    case "overdue":
      return "bg-destructive";
    case "week":
      return "bg-amber-400";
    case "month":
      return "bg-brand";
    default:
      return "bg-muted-foreground/60";
  }
}

export function urgencyOf(cost: FixedCost, todayKey: string): UrgencyGroup {
  if (!cost.dueDate) return "undated";
  const days = daysUntilDue(cost.dueDate, todayKey);
  if (days == null) return "undated";
  if (days < 0) return "overdue";
  if (days <= 7) return "week";
  if (days <= 30) return "month";
  return "later";
}

export function payableByUrgency(costs: FixedCost[], todayKey: string) {
  const order = new Map(
    URGENCY_GROUPS.map((group, index) => [group.value, index]),
  );
  return costs
    .filter((cost) => !isCompletedFixedCost(cost))
    .sort(
      (a, b) =>
        (order.get(urgencyOf(a, todayKey)) ?? 0) -
          (order.get(urgencyOf(b, todayKey)) ?? 0) ||
        (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"),
    );
}

export interface InstallmentSeries {
  key: string;
  latest: FixedCost;
  current: number;
  total: number;
  percent: number;
  paid: number;
  remaining: number;
  endIndex: number;
  estimatedBalance: number;
}

export function installmentSeries(costs: FixedCost[]): InstallmentSeries[] {
  const latest = new Map<string, FixedCost>();
  for (const cost of costs) {
    const plan = parseInstallment(cost.installment);
    if (!plan) continue;
    const key = [
      cost.description.trim().toLowerCase(),
      cost.personId ?? "",
      plan.total,
    ].join("|");
    const previous = latest.get(key);
    if (!previous || costMonthIndex(cost) > costMonthIndex(previous))
      latest.set(key, cost);
  }
  return [...latest.entries()]
    .map(([key, cost]) => {
      const plan = parseInstallment(cost.installment)!;
      const paid = plan.current - (isCompletedFixedCost(cost) ? 0 : 1);
      const remaining = plan.total - paid;
      const amount = cost.amountInPen ?? cost.amount;
      return {
        key,
        latest: cost,
        current: plan.current,
        total: plan.total,
        percent: plan.percent,
        paid,
        remaining,
        endIndex: costMonthIndex(cost) + (plan.total - plan.current),
        estimatedBalance: Math.round(remaining * amount * 100) / 100,
      };
    })
    .sort((a, b) => a.endIndex - b.endIndex);
}

export const monthGroupKey = (cost: FixedCost) =>
  monthIndexKey(costMonthIndex(cost));

export function monthGroupLabel(key: string) {
  const index = monthKeyIndex(key);
  if (index == null) return key;
  return `${getMonthName((index % 12) + 1)} ${Math.floor(index / 12)}`;
}

export function localTodayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function relativeDueLabel(days: number | null) {
  if (days == null) return null;
  if (days < 0)
    return `venció hace ${Math.abs(days)} ${Math.abs(days) === 1 ? "día" : "días"}`;
  if (days === 0) return "vence hoy";
  return `en ${days} ${days === 1 ? "día" : "días"}`;
}
