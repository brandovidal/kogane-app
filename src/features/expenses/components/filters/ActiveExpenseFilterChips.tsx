import {
  useCategories,
  usePaymentMethods,
  usePeople,
} from "@/shared/api/hooks/catalogs";
import {
  EXPENSE_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/shared/constants/finance";
import { SUBSCRIPTION_PERIOD_LABELS } from "@/features/subscriptions/constants/subscriptions";
import {
  PERSON_ALL,
  PERSON_ME,
  PERSON_FILTER_LABELS,
  INSTALLMENT_FILTER,
  SHARED_FILTER,
} from "../../constants/expense-filters";
import type {
  ExpenseFilterKey,
  ExpenseFilterValues,
} from "../../types/expense-filters";
import {
  AppliedFilterChips,
  type AppliedFilterChip,
} from "@/shared/components/filters/AppliedFilterChips";
import { formatDate, getMonthName } from "@/shared/lib/dates";

export interface ActiveExpenseFilterChipsProps<T extends string | string[] = string> {
  fields: ExpenseFilterKey[];
  value: ExpenseFilterValues;
  onChange: (value: ExpenseFilterValues) => void;
  me?: string;
  groupBy?: T;
  onGroupByChange?: (value: T) => void;
  groupByLabel?: string;
  groupByLabels?: Record<string, string>;
  periodChip?: { label: string; onRemove: () => void };
  tone?: "default" | "brand";
  maxVisibleItems?: number;
  collapsible?: boolean;
  showClearAll?: boolean;
}

export function ActiveExpenseFilterChips<T extends string | string[] = string>({
  fields,
  value,
  onChange,
  me,
  groupBy,
  onGroupByChange,
  groupByLabel,
  groupByLabels,
  periodChip,
  tone,
  maxVisibleItems,
  collapsible = true,
  showClearAll = true,
}: ActiveExpenseFilterChipsProps<T>) {
  const categories = useCategories().data ?? [];
  const methods = usePaymentMethods().data ?? [];
  const people = usePeople().data ?? [];
  const labels: Partial<Record<ExpenseFilterKey, string>> = {
    q: value.q?.trim() ? `Buscar: ${value.q.trim()}` : undefined,
    month: value.month
      ? `Mes: ${getMonthName(Number(value.month))}`
      : undefined,
    year: value.year ? `Año: ${value.year}` : undefined,
    person:
      value.person && value.person !== PERSON_ALL
        ? `Persona: ${value.person === PERSON_ME ? PERSON_FILTER_LABELS.ME : value.person === me ? (people.find((person) => person.id === me)?.name ?? PERSON_FILTER_LABELS.ME) : (people.find((person) => person.id === value.person)?.name ?? value.person)}`
        : undefined,
    category: value.category
      ? `Categoría: ${value.category
          .split(",")
          .filter(Boolean)
          .map((id) => categories.find((category) => category.id === id)?.name ?? id)
          .join(", ")}`
      : undefined,
    method: value.method
      ? `Medio de pago: ${methods.find((method) => method.id === value.method)?.name ?? value.method}`
      : undefined,
    currency: value.currency ? `Moneda: ${value.currency}` : undefined,
    status: value.status
      ? `Estado: ${PAYMENT_STATUS_LABELS[value.status] ?? value.status}`
      : undefined,
    type: value.type
      ? `Tipo: ${EXPENSE_TYPE_LABELS[value.type] ?? value.type}`
      : undefined,
    shared: value.shared
      ? `Compartidos: ${value.shared === SHARED_FILTER.SHARED ? "Sí" : "No"}`
      : undefined,
    period: value.period
      ? `Período: ${SUBSCRIPTION_PERIOD_LABELS[value.period] ?? value.period}`
      : undefined,
    installments: value.installments
      ? `Cuotas: ${value.installments === INSTALLMENT_FILTER.WITH ? "Con cuotas" : "Sin cuotas"}`
      : undefined,
    dueFrom: value.dueFrom
      ? `Vence desde: ${formatDate(value.dueFrom)}`
      : undefined,
    dueTo: value.dueTo ? `Vence hasta: ${formatDate(value.dueTo)}` : undefined,
  };
  const chips: AppliedFilterChip[] = [
    ...(periodChip
      ? [
          {
            key: "period",
            label: periodChip.label,
            onRemove: periodChip.onRemove,
          },
        ]
      : []),
    ...fields
      .filter(
        (key) =>
          labels[key] && !(periodChip && (key === "month" || key === "year")),
      )
      .map((key) => ({
        key,
        label: labels[key]!,
        onRemove: () => onChange({ ...value, [key]: undefined }),
      })),
  ];
  const isGrouped = Array.isArray(groupBy)
    ? groupBy.length > 0
    : !!groupBy && groupBy !== "none";
  if (!chips.length && !(isGrouped && onGroupByChange)) return null;
  if (isGrouped && groupBy !== undefined && onGroupByChange) {
    const groupFields = Array.isArray(groupBy)
      ? groupBy.map(String)
      : [String(groupBy)];
    if (Array.isArray(groupBy)) {
      const labels = groupFields.map((field) =>
        (groupByLabels?.[field] ?? field)
          .replace(/^Por\s+/i, "")
          .replace(/^./, (letter) => letter.toLocaleUpperCase()),
      );
      chips.push({
        key: "group-by",
        label: labels.join(" › "),
        onRemove: () => onGroupByChange([] as T),
        kind: "group",
      });
    } else {
      const field = groupFields[0];
      const label = groupByLabels?.[field] ?? groupByLabel ?? field;
      chips.push({
        key: `group-by-${field}`,
        label: `Agrupar: ${label}`,
        onRemove: () => onGroupByChange((Array.isArray(groupBy) ? [] : "none") as T),
        kind: "group",
      });
    }
  }
  return (
    <AppliedFilterChips
      items={chips}
      ariaLabel="Filtros y agrupación activos"
      collapsible={collapsible}
      tone={tone}
      maxVisibleItems={maxVisibleItems}
      onClearAll={showClearAll ? () => {
        onChange({});
        if (isGrouped && onGroupByChange) {
          onGroupByChange((Array.isArray(groupBy) ? [] : "none") as T);
        }
      } : undefined}
    />
  );
}
