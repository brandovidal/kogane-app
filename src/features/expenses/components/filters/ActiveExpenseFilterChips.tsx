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

export interface ActiveExpenseFilterChipsProps {
  fields: ExpenseFilterKey[];
  value: ExpenseFilterValues;
  onChange: (value: ExpenseFilterValues) => void;
  me?: string;
  groupBy?: string;
  onGroupByChange?: (value: string) => void;
  groupByLabel?: string;
}

export function ActiveExpenseFilterChips({
  fields,
  value,
  onChange,
  me,
  groupBy,
  onGroupByChange,
  groupByLabel,
}: ActiveExpenseFilterChipsProps) {
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
      ? `Categoría: ${categories.find((category) => category.id === value.category)?.name ?? value.category}`
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
  const chips: AppliedFilterChip[] = fields
    .filter((key) => labels[key])
    .map((key) => ({
      key,
      label: labels[key]!,
      onRemove: () => onChange({ ...value, [key]: undefined }),
    }));
  const hasGrouping = groupBy && groupBy !== "none" && onGroupByChange;
  if (!chips.length && !hasGrouping) return null;
  if (hasGrouping)
    chips.push({
      key: "group-by",
      label: `Agrupar: ${groupByLabel ?? groupBy}`,
      onRemove: () => onGroupByChange("none"),
      kind: "group",
    });
  return (
    <AppliedFilterChips
      items={chips}
      ariaLabel="Filtros y agrupación activos"
    />
  );
}
