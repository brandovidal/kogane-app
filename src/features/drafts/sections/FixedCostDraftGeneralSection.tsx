import { Banknote, Coins, FileText, ListFilter, ReceiptText, Tags, UserRound, WalletCards } from "lucide-react";
import type { DraftFields } from "../hooks/drafts";
import type { DraftFormSectionProps } from "../types/draft-form";
import { CategorySelect } from "@/features/categories/components/CategorySelect";
import { PaymentMethodSelect } from "@/features/settings/components/PaymentMethodSelect";
import { PersonSelect } from "@/features/settings/components/PersonSelect";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { FormField } from "@/shared/components/forms/FormField";
import { CURRENCIES, EXPENSE_TYPE_LABELS, EXPENSE_TYPES } from "@/shared/constants/finance";
import { Input } from "@/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

export function FixedCostDraftGeneralSection({ value, onChange, missingFields }: DraftFormSectionProps) {
  const set = <K extends keyof DraftFields>(key: K, next: DraftFields[K]) => onChange({ ...value, [key]: next });
  const missing = (field: string) => missingFields.includes(field);

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-semibold"><FieldLabel icon={ReceiptText}>Datos del gasto</FieldLabel></h3>
        <FormField label="Descripción" icon={FileText} missing={missing("description")}>
          <Input value={value.description ?? ""} onChange={(event) => set("description", event.target.value)} placeholder="Ej: Alquiler, internet..." />
        </FormField>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
          <FormField label="Monto" icon={Banknote} missing={missing("amount")}>
            <InputGroup>
              <InputGroupInput aria-label="Monto del gasto" type="number" min={0.01} step="0.01" value={value.amount ?? ""} onChange={(event) => set("amount", event.target.value === "" ? null : Number(event.target.value))} />
              <InputGroupAddon><InputGroupText>{value.currency === "USD" ? "$" : "S/"}</InputGroupText></InputGroupAddon>
            </InputGroup>
          </FormField>
          <FormField label="Moneda" icon={Coins}>
            <Select value={value.currency ?? "PEN"} onValueChange={(currency) => set("currency", currency as DraftFields["currency"])}>
              <SelectTrigger aria-label="Moneda del gasto"><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((currency) => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>
      </section>
      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-semibold"><FieldLabel icon={WalletCards}>Clasificación y asignación</FieldLabel></h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Categoría" icon={Tags} missing={missing("categoryId")}>
            <CategorySelect allowEmpty value={value.categoryId} onChange={(id) => set("categoryId", id)} />
          </FormField>
          <FormField label="Tipo de gasto" icon={ListFilter}>
            <Select value={value.expenseType ?? "essential"} onValueChange={(type) => set("expenseType", type as DraftFields["expenseType"])}>
              <SelectTrigger aria-label="Tipo de gasto"><SelectValue /></SelectTrigger>
              <SelectContent>{EXPENSE_TYPES.map((type) => <SelectItem key={type} value={type}>{EXPENSE_TYPE_LABELS[type]}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label={value.sharedWith?.shares.length ? "Paga" : "Para quién"} icon={UserRound} missing={missing("personId")}>
            <PersonSelect value={value.personId} onChange={(id) => set("personId", id)} />
          </FormField>
          <FormField label="Cuenta" icon={WalletCards} missing={missing("paymentMethodId")}>
            <PaymentMethodSelect allowEmpty value={value.paymentMethodId} onChange={(id) => set("paymentMethodId", id)} />
          </FormField>
        </div>
      </section>
    </div>
  );
}
