import { Search, X } from "lucide-react";

import { useCategories, usePaymentMethods, usePeople } from "@/shared/api/hooks/catalogs";
import { EXPENSE_TYPE_LABELS, PAYMENT_STATUS_LABELS, SUBSCRIPTION_PERIOD_LABELS } from "@/shared/labels";
import { hasActiveFilters, PERSON_ALL, type ExpenseFilterKey, type ExpenseFilterValues } from "@/shared/lib/expense-filters";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const ALL = "__all__";
const ME = "__me__"; // the person filter is empty: Yo

interface ExpenseFiltersProps {
  fields: ExpenseFilterKey[];
  value: ExpenseFilterValues;
  onChange: (value: ExpenseFilterValues) => void;
  statuses?: string[]; // the payment statuses of that table
  shown: number;
  total: number;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  width = "w-[150px]",
}: {
  label: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string | undefined) => void;
  width?: string;
}) {
  return (
    <Select value={value ?? ALL} onValueChange={(next) => onChange(next === ALL ? undefined : next)}>
      <SelectTrigger className={`h-9 ${width}`} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: todos</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const entriesOf = (labels: Record<string, string>, keys?: string[]) =>
  (keys ?? Object.keys(labels)).map((key) => ({ value: key, label: labels[key] ?? key }));

// Filter bar of the expense pages (D79); the person and the month live in the header
export function ExpenseFilters({ fields, value, onChange, statuses, shown, total }: ExpenseFiltersProps) {
  const categories = useCategories().data ?? [];
  const methods = usePaymentMethods().data?.filter((method) => method.isActive) ?? [];
  const others = usePeople().data?.filter((person) => person.isActive && !person.isDefault) ?? [];
  const set = (key: ExpenseFilterKey, next: string | undefined) => onChange({ ...value, [key]: next || undefined });
  const has = (key: ExpenseFilterKey) => fields.includes(key);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {has("person") && (
        <Select value={value.person ?? ME} onValueChange={(next) => set("person", next === ME ? undefined : next)}>
          <SelectTrigger className="h-9 w-[150px]" aria-label="Persona">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ME}>Persona: Yo</SelectItem>
            <SelectItem value={PERSON_ALL}>Persona: todas</SelectItem>
            {others.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {has("q") && (
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." value={value.q ?? ""} onChange={(event) => set("q", event.target.value)} className="h-9 pl-9" />
        </div>
      )}
      {has("category") && (
        <FilterSelect
          label="Categoría"
          value={value.category}
          options={categories.map((category) => ({ value: category.id, label: category.name }))}
          onChange={(next) => set("category", next)}
        />
      )}
      {has("method") && (
        <FilterSelect
          label="Medio de pago"
          value={value.method}
          options={methods.map((method) => ({ value: method.id, label: method.name }))}
          onChange={(next) => set("method", next)}
        />
      )}
      {has("status") && (
        <FilterSelect
          label="Estado"
          value={value.status}
          options={entriesOf(PAYMENT_STATUS_LABELS, statuses)}
          onChange={(next) => set("status", next)}
        />
      )}
      {has("period") && (
        <FilterSelect
          label="Periodo"
          value={value.period}
          options={entriesOf(SUBSCRIPTION_PERIOD_LABELS)}
          onChange={(next) => set("period", next)}
        />
      )}
      {has("installments") && (
        <FilterSelect
          label="Cuotas"
          value={value.installments}
          options={[
            { value: "with", label: "En cuotas" },
            { value: "without", label: "Sin cuotas" },
          ]}
          onChange={(next) => set("installments", next)}
          width="w-[130px]"
        />
      )}
      {has("type") && (
        <FilterSelect label="Tipo" value={value.type} options={entriesOf(EXPENSE_TYPE_LABELS)} onChange={(next) => set("type", next)} width="w-[130px]" />
      )}
      {has("shared") && (
        <FilterSelect
          label="Compartidos"
          value={value.shared}
          options={[
            { value: "yes", label: "Compartidos" },
            { value: "no", label: "Solo míos" },
          ]}
          onChange={(next) => set("shared", next)}
          width="w-[180px]"
        />
      )}
      {hasActiveFilters(value) && (
        <>
          <Button variant="ghost" size="sm" onClick={() => onChange({})}>
            <X className="mr-1 h-3.5 w-3.5" /> Limpiar
          </Button>
          <span className="text-xs text-muted-foreground">
            {shown} de {total}
          </span>
        </>
      )}
    </div>
  );
}
