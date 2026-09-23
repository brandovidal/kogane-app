import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { CategorySelect, PaymentMethodSelect, PersonSelect } from "@/shared/components/CatalogSelect";
import type { DraftFields } from "@/shared/api/hooks/drafts";
import {
  CURRENCIES,
  DESTINATION_LABELS,
  EXPENSE_TYPE_LABELS,
  EXPENSE_TYPES,
  SUBSCRIPTION_PERIOD_LABELS,
  SUBSCRIPTION_PERIODS,
} from "@/shared/labels";
import { FIELDS_BY_DESTINATION, FORM_DESTINATIONS } from "../draft-form";

interface DraftFormProps {
  value: DraftFields;
  onChange: (value: DraftFields) => void;
  missingFields?: string[];
}

const Field = ({ label, missing, children }: { label: string; missing?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium">
      {label}
      {missing && <span className="ml-1 text-xs text-destructive">falta</span>}
    </label>
    {children}
  </div>
);

// The fields of one expense for any destination (D40); the missing ones come from kogane-api (missingFields)
export function DraftForm({ value, onChange, missingFields = [] }: DraftFormProps) {
  const set = <K extends keyof DraftFields>(key: K, fieldValue: DraftFields[K]) => onChange({ ...value, [key]: fieldValue });
  const rules = FIELDS_BY_DESTINATION[value.destination ?? "daily"] ?? FIELDS_BY_DESTINATION.daily;
  const missing = (field: string) => missingFields.includes(field);
  const isDebt = value.destination === "receivable" || value.destination === "payable";

  return (
    <div className="space-y-4">
      <Field label="Destino" missing={missing("destination")}>
        <Select value={value.destination ?? ""} onValueChange={(v) => set("destination", v as DraftFields["destination"])}>
          <SelectTrigger><SelectValue placeholder="Elige dónde va" /></SelectTrigger>
          <SelectContent>
            {FORM_DESTINATIONS.map((destination) => (
              <SelectItem key={destination} value={destination}>{DESTINATION_LABELS[destination]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Descripción" missing={missing("description")}>
        <Input value={value.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Ej: Almuerzo, Netflix..." />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={isDebt && value.installment ? "Monto por cuota" : "Monto"} missing={missing("amount")}>
          <Input
            type="number"
            step="0.01"
            value={value.amount ?? ""}
            onChange={(e) => set("amount", e.target.value === "" ? null : Number(e.target.value))}
          />
        </Field>
        <Field label="Moneda">
          <Select value={value.currency ?? "PEN"} onValueChange={(v) => set("currency", v as DraftFields["currency"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha">
          <Input type="date" value={value.spentAt?.slice(0, 10) ?? ""} onChange={(e) => set("spentAt", e.target.value || null)} />
        </Field>
        <Field label={isDebt ? "Persona" : "Para quién"} missing={missing("personId")}>
          <PersonSelect value={value.personId} onChange={(id) => set("personId", id)} />
        </Field>
      </div>

      {rules.paymentMethod && (
        <Field label={rules.cardsOnly ? "Tarjeta" : "Medio de pago"} missing={missing("paymentMethodId")}>
          <PaymentMethodSelect
            type={rules.cardsOnly ? "credit_card" : undefined}
            allowEmpty
            value={value.paymentMethodId}
            onChange={(id) => set("paymentMethodId", id)}
          />
        </Field>
      )}

      {rules.category && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoría" missing={missing("categoryId")}>
            <CategorySelect allowEmpty value={value.categoryId} onChange={(id) => set("categoryId", id)} />
          </Field>
          <Field label="Tipo de gasto">
            <Select value={value.expenseType ?? "essential"} onValueChange={(v) => set("expenseType", v as DraftFields["expenseType"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXPENSE_TYPES.map((type) => <SelectItem key={type} value={type}>{EXPENSE_TYPE_LABELS[type]}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
      )}

      {(rules.period || rules.installment) && (
        <div className="grid grid-cols-2 gap-3">
          {rules.period && (
            <Field label="Período" missing={missing("period")}>
              <Select value={value.period ?? "monthly"} onValueChange={(v) => set("period", v as DraftFields["period"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_PERIODS.map((period) => (
                    <SelectItem key={period} value={period}>{SUBSCRIPTION_PERIOD_LABELS[period]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          {rules.installment && (
            <Field label="Cuota (n/m)">
              <Input value={value.installment ?? ""} onChange={(e) => set("installment", e.target.value)} placeholder={isDebt ? "1/3 crea las 3 cuotas" : "Ej: 1/3"} />
            </Field>
          )}
        </div>
      )}

      <Field label="Nota">
        <Input value={value.notes ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="Opcional" />
      </Field>
    </div>
  );
}
