import { useCategories, usePaymentMethods, usePeople } from "@/shared/api/hooks/catalogs";
import { EXPENSE_TYPE_LABELS, PAYMENT_STATUS_LABELS, SUBSCRIPTION_PERIOD_LABELS } from "@/shared/labels";
import { PERSON_ALL, type ExpenseFilterKey, type ExpenseFilterValues } from "@/shared/lib/expense-filters";
import { AppliedFilterChips, type AppliedFilterChip } from "./AppliedFilterChips";

interface ActiveExpenseFilterChipsProps {
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
    person: value.person && value.person !== PERSON_ALL
      ? `Persona: ${value.person === "__me__" ? "Yo" : value.person === me ? people.find((person) => person.id === me)?.name ?? "Yo" : people.find((person) => person.id === value.person)?.name ?? value.person}`
      : undefined,
    category: value.category ? `Categoría: ${categories.find((category) => category.id === value.category)?.name ?? value.category}` : undefined,
    method: value.method ? `Medio de pago: ${methods.find((method) => method.id === value.method)?.name ?? value.method}` : undefined,
    currency: value.currency ? `Moneda: ${value.currency}` : undefined,
    status: value.status ? `Estado: ${PAYMENT_STATUS_LABELS[value.status] ?? value.status}` : undefined,
    type: value.type ? `Tipo: ${EXPENSE_TYPE_LABELS[value.type] ?? value.type}` : undefined,
    shared: value.shared ? `Compartidos: ${value.shared === "yes" ? "Sí" : "No"}` : undefined,
    period: value.period ? `Período: ${SUBSCRIPTION_PERIOD_LABELS[value.period] ?? value.period}` : undefined,
    installments: value.installments ? `Cuotas: ${value.installments === "with" ? "Con cuotas" : "Sin cuotas"}` : undefined,
  };
  const chips: AppliedFilterChip[] = fields
    .filter((key) => labels[key])
    .map((key) => ({ key, label: labels[key]!, onRemove: () => onChange({ ...value, [key]: undefined }) }));
  const hasGrouping = groupBy && groupBy !== "none" && onGroupByChange;
  if (!chips.length && !hasGrouping) return null;
  if (hasGrouping) chips.push({
    key: "group-by",
    label: `Agrupar: ${groupByLabel ?? groupBy}`,
    onRemove: () => onGroupByChange("none"),
    kind: "group",
  });
  return <AppliedFilterChips items={chips} ariaLabel="Filtros y agrupación activos" />;
}
