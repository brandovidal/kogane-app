import { Input } from "@/ui/input";
import { ArrowRightLeft } from "lucide-react";
import { InstallmentFields } from "@/features/expenses/components/forms/InstallmentFields";
import { installmentError } from "@/features/expenses/lib/installments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { CategorySelect } from "@/features/categories/components/CategorySelect";
import { PaymentMethodSelect } from "@/features/settings/components/PaymentMethodSelect";
import { PersonSelect } from "@/features/settings/components/PersonSelect";
import { FormField as Field } from "@/shared/components/forms/FormField";
import type { DraftFields } from "@/features/drafts/hooks/drafts";
import {
  CURRENCIES,
  EXPENSE_TYPE_LABELS,
  EXPENSE_TYPES,
} from "@/shared/constants/finance";
import { DESTINATION_LABELS } from "@/features/drafts/constants/destinations";
import {
  SUBSCRIPTION_KIND_LABELS,
  SUBSCRIPTION_PERIOD_LABELS,
  SUBSCRIPTION_PERIODS,
} from "@/features/subscriptions/constants/subscriptions";
import {
  FIELDS_BY_DESTINATION,
  FORM_DESTINATIONS,
} from "@/features/drafts/lib/draft-form";
import { FixedCostDraftTabs } from "./FixedCostDraftTabs";
import { ShareEditor } from "./ShareEditor";

interface DraftFormProps {
  value: DraftFields;
  onChange: (value: DraftFields) => void;
  missingFields?: string[];
}

// The fields of one expense for any destination (D40); the missing ones come from kogane-api (missingFields)
export function DraftForm({
  value,
  onChange,
  missingFields = [],
}: DraftFormProps) {
  const set = <K extends keyof DraftFields>(
    key: K,
    fieldValue: DraftFields[K],
  ) => onChange({ ...value, [key]: fieldValue });
  const rules =
    FIELDS_BY_DESTINATION[value.destination ?? "daily"] ??
    FIELDS_BY_DESTINATION.daily;
  const missing = (field: string) => missingFields.includes(field);
  const isDebt =
    value.destination === "receivable" || value.destination === "payable";
  const isFixedCost = value.destination === "fixed_cost";

  return (
    <div className="space-y-4">
      <Field
        label="Registrar en"
        icon={ArrowRightLeft}
        missing={missing("destination")}
      >
        <Select
          value={value.destination ?? ""}
          onValueChange={(v) =>
            set("destination", v as DraftFields["destination"])
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Elige dónde va" />
          </SelectTrigger>
          <SelectContent>
            {FORM_DESTINATIONS.map((destination) => (
              <SelectItem key={destination} value={destination}>
                {DESTINATION_LABELS[destination]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {isFixedCost ? (
        <FixedCostDraftTabs
          value={value}
          onChange={onChange}
          missingFields={missingFields}
        />
      ) : (
        <div className="space-y-4">
          <Field label="Descripción" missing={missing("description")}>
            <Input
              value={value.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Ej: Almuerzo, Netflix..."
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label={isDebt && value.installment ? "Monto por cuota" : "Monto"}
              missing={missing("amount")}
            >
              <Input
                type="number"
                step="0.01"
                value={value.amount ?? ""}
                onChange={(e) =>
                  set(
                    "amount",
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
              />
            </Field>
            <Field label="Moneda">
              <Select
                value={value.currency ?? "PEN"}
                onValueChange={(v) =>
                  set("currency", v as DraftFields["currency"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha">
              <Input
                type="date"
                value={value.spentAt?.slice(0, 10) ?? ""}
                onChange={(e) => set("spentAt", e.target.value || null)}
              />
            </Field>
            <Field
              label={
                isDebt
                  ? "Persona"
                  : value.sharedWith?.shares.length
                    ? "Paga"
                    : "Para quién"
              }
              missing={missing("personId")}
            >
              <PersonSelect
                value={value.personId}
                onChange={(id) => set("personId", id)}
              />
            </Field>
          </div>

          {rules.paymentMethod && (
            <Field
              label={rules.cardsOnly ? "Tarjeta" : "Medio de pago"}
              missing={missing("paymentMethodId")}
            >
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
                <CategorySelect
                  allowEmpty
                  value={value.categoryId}
                  onChange={(id) => set("categoryId", id)}
                />
              </Field>
              <Field label="Tipo de gasto">
                <Select
                  value={value.expenseType ?? "essential"}
                  onValueChange={(v) =>
                    set("expenseType", v as DraftFields["expenseType"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {EXPENSE_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}

          {(rules.period || rules.installment) && (
            <div className="grid grid-cols-2 gap-3">
              {rules.period && (
                <Field label="Período" missing={missing("period")}>
                  <Select
                    value={value.period ?? "monthly"}
                    onValueChange={(v) =>
                      set("period", v as DraftFields["period"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBSCRIPTION_PERIODS.map((period) => (
                        <SelectItem key={period} value={period}>
                          {SUBSCRIPTION_PERIOD_LABELS[period]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              {rules.period && (
                <Field label="Es">
                  <Select
                    value={value.kind ?? "platform"}
                    onValueChange={(v) => set("kind", v as DraftFields["kind"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SUBSCRIPTION_KIND_LABELS).map(
                        ([kind, label]) => (
                          <SelectItem key={kind} value={kind}>
                            {kind === "platform"
                              ? "Plataforma"
                              : `Recurrente · ${label}`}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              {rules.installment && (
                <div className="col-span-2 space-y-2">
                  <InstallmentFields
                    value={value.installment}
                    onChange={(installment) => set("installment", installment)}
                    missing={missing("installment")}
                    error={installmentError(value.installment)}
                  />
                  {isDebt && (
                    <p className="text-xs text-muted-foreground">
                      El total indica cuántas cuotas se crearán.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {rules.period && value.kind && value.kind !== "platform" && (
            <Field label="N.º de suministro">
              <Input
                value={value.supplyNumber ?? ""}
                onChange={(e) => set("supplyNumber", e.target.value)}
                placeholder="Opcional (Bitel, Enel…)"
              />
            </Field>
          )}

          {rules.shareable && (
            <ShareEditor
              value={value.sharedWith}
              total={value.amount}
              currency={value.currency ?? "PEN"}
              onChange={(sharedWith) => set("sharedWith", sharedWith)}
            />
          )}

          <Field label="Nota">
            <Input
              value={value.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Opcional"
            />
          </Field>
        </div>
      )}
    </div>
  );
}
