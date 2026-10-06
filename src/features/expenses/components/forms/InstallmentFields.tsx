import { useId } from "react";
import { ListOrdered } from "lucide-react";
import { FormField } from "@/shared/components/forms/FormField";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/ui/input-group";
import { parseInstallment } from "../../lib/installments";

export interface InstallmentFieldsProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  error?: string;
  missing?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export function InstallmentFields({ value, onChange, error, missing, disabled, compact = false }: InstallmentFieldsProps) {
  const id = useId();
  const { current, total } = parseInstallment(value);
  const errorId = `${id}-error`;
  const change = (part: "current" | "total", next: string) => {
    if (!/^\d{0,3}$/.test(next)) return;
    const nextCurrent = part === "current" ? next : current;
    const nextTotal = part === "total" ? next : total;
    onChange(nextCurrent || nextTotal ? `${nextCurrent}/${nextTotal}` : null);
  };

  return (
    <div className="space-y-2">
      <div className={compact ? "grid grid-cols-2 gap-2" : "grid gap-3 sm:grid-cols-2"}>
        <FormField label="Cuota actual" htmlFor={`${id}-current`} missing={missing}>
          <InputGroup>
            <InputGroupInput id={`${id}-current`} type="number" inputMode="numeric" min={1} max={999} step={1} value={current} disabled={disabled} placeholder="1" onChange={(event) => change("current", event.target.value)} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} className={compact ? "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" : undefined} />
            <InputGroupAddon><ListOrdered aria-hidden="true" /></InputGroupAddon>
          </InputGroup>
        </FormField>
        <FormField label="Total de cuotas" htmlFor={`${id}-total`} missing={missing}>
          <InputGroup>
            <InputGroupInput id={`${id}-total`} type="number" inputMode="numeric" min={1} max={999} step={1} value={total} disabled={disabled} placeholder="12" onChange={(event) => change("total", event.target.value)} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} className={compact ? "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" : undefined} />
            <InputGroupAddon><ListOrdered aria-hidden="true" /></InputGroupAddon>
          </InputGroup>
        </FormField>
      </div>
      {error && <p id={errorId} role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
