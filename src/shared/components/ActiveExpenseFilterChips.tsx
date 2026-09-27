import { X } from "lucide-react";

import { useCategories, usePaymentMethods, usePeople } from "@/shared/api/hooks/catalogs";
import { EXPENSE_TYPE_LABELS, PAYMENT_STATUS_LABELS, SUBSCRIPTION_PERIOD_LABELS } from "@/shared/labels";
import { PERSON_ALL, type ExpenseFilterKey, type ExpenseFilterValues } from "@/shared/lib/expense-filters";
import { Button } from "@/ui/button";

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
  const chips = fields
    .filter((key) => labels[key])
    .map((key) => ({ key, label: labels[key]! }));
  const hasGrouping = groupBy && groupBy !== "none" && onGroupByChange;
  if (!chips.length && !hasGrouping) return null;

  return (
    <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap py-0.5" aria-label="Filtros y agrupación activos">
      {chips.map(({ key, label }) => (
        <Button
          key={key}
          variant="secondary"
          size="xs"
          className="max-w-56"
          onClick={() => onChange({ ...value, [key]: undefined })}
          aria-label={`Quitar filtro ${label}`}
          title={label}
        >
          <span className="truncate">{label}</span><X />
        </Button>
      ))}
      {hasGrouping && (
        <>
          {chips.length > 0 && <span aria-hidden="true" className="mx-1 h-5 border-l" />}
          <Button
            variant="outline"
            size="xs"
            className="max-w-56"
            onClick={() => onGroupByChange("none")}
            aria-label="Quitar agrupación"
            title={`Agrupar: ${groupByLabel ?? groupBy}`}
          >
            <span className="truncate">Agrupar: {groupByLabel ?? groupBy}</span><X />
          </Button>
        </>
      )}
    </div>
  );
}
