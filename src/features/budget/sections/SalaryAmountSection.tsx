import { useId } from "react";
import { Banknote, Percent } from "lucide-react";
import { FormField } from "@/shared/components/forms/FormField";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/ui/input-group";
import { formatCurrency } from "@/shared/lib/currency";

export interface SalaryAmountSectionProps {
  salary: string;
  limitPercent: string;
  onSalaryChange: (value: string) => void;
  onPercentChange: (value: string) => void;
  errors: { salary?: string[]; limitPercent?: string[] };
  limit: number | null;
  disabled: boolean;
}

export function SalaryAmountSection({
  salary,
  limitPercent,
  onSalaryChange,
  onPercentChange,
  errors,
  limit,
  disabled,
}: SalaryAmountSectionProps) {
  const id = useId();
  return (
    <div className="space-y-4">
      <FormField
        label="Sueldo mensual"
        icon={Banknote}
        htmlFor={`${id}-salary`}
        error={errors.salary?.[0]}
      >
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>S/</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            id={`${id}-salary`}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            required
            value={salary}
            onChange={(event) => onSalaryChange(event.target.value)}
            disabled={disabled}
            aria-invalid={!!errors.salary}
          />
        </InputGroup>
      </FormField>
      <FormField
        label="Límite de gasto"
        icon={Percent}
        htmlFor={`${id}-percent`}
        error={errors.limitPercent?.[0]}
      >
        <InputGroup>
          <InputGroupInput
            id={`${id}-percent`}
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            required
            value={limitPercent}
            onChange={(event) => onPercentChange(event.target.value)}
            disabled={disabled}
            aria-invalid={!!errors.limitPercent}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>%</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </FormField>
      <div
        className="flex items-center justify-between rounded-lg border bg-muted/20 p-3 text-sm"
        aria-live="polite"
      >
        <span className="text-muted-foreground">Límite del mes</span>
        <span className="font-medium tabular-nums">
          {limit != null ? formatCurrency(limit) : "—"}
        </span>
      </div>
    </div>
  );
}
