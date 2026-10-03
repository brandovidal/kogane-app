import { useId } from "react";
import { Banknote, Coins, FileText } from "lucide-react";
import type { IncomeFormController } from "../hooks/useIncomeForm";
import { FormField } from "@/shared/components/forms/FormField";
import { CURRENCIES } from "@/shared/constants/finance";
import { Input } from "@/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

export function IncomeGeneralSection({ form }: { form: IncomeFormController }) {
  const id = useId();
  return (
    <section
      className="space-y-4 rounded-lg border p-4"
      aria-labelledby={`${id}-title`}
    >
      <h3 id={`${id}-title`} className="text-sm font-semibold">
        Datos del ingreso
      </h3>
      <FormField
        label="Descripción *"
        icon={FileText}
        htmlFor={`${id}-description`}
        error={form.errorFor("description")}
      >
        <Input
          id={`${id}-description`}
          required
          autoFocus
          placeholder="Ej. Bono, trabajo extra o venta"
          value={form.value.description}
          onChange={(event) => form.update("description", event.target.value)}
          onBlur={() => form.touch("description")}
          aria-invalid={!!form.errorFor("description")}
        />
      </FormField>
      <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
        <FormField
          label="Monto *"
          icon={Banknote}
          htmlFor={`${id}-amount`}
          error={form.errorFor("amount")}
        >
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>
                {form.value.currency === "PEN" ? "S/" : "$"}
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={`${id}-amount`}
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
              value={form.value.amount}
              onChange={(event) => form.update("amount", event.target.value)}
              onBlur={() => form.touch("amount")}
              aria-invalid={!!form.errorFor("amount")}
            />
          </InputGroup>
        </FormField>
        <FormField label="Moneda" icon={Coins} htmlFor={`${id}-currency`}>
          <Select
            value={form.value.currency}
            onValueChange={(value) =>
              form.update("currency", value as typeof form.value.currency)
            }
            disabled={form.pending}
          >
            <SelectTrigger id={`${id}-currency`} className="w-full">
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
        </FormField>
      </div>
    </section>
  );
}
