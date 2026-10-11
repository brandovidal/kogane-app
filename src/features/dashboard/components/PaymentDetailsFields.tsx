import { useAccounts } from "@/shared/api/hooks/catalogs";
import { FormField as Field } from "@/shared/components/forms/FormField";
import { Input } from "@/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  PAY_KINDS,
  PAY_METHODS,
  type PayAmount,
  type PayDetails,
  type PayKind,
  type PayMethod,
} from "@/features/calendar/lib/payment-details";

const NONE = "none";

// Day, medio de pago, cuenta de salida and note of the payments; with one element selected also its amount
// (and total / minimum / partial for a card statement)
export function PaymentDetailsFields({
  details,
  onDetails,
  single,
  onSingle,
  isCardStatement,
  error,
}: {
  details: PayDetails;
  onDetails: (next: PayDetails) => void;
  single: PayAmount | null;
  onSingle: (next: PayAmount) => void;
  isCardStatement: boolean;
  error?: string | null;
}) {
  const accounts = useAccounts(true).data ?? [];
  const set = <K extends keyof PayDetails>(key: K, value: PayDetails[K]) =>
    onDetails({ ...details, [key]: value });

  return (
    <div className="grid gap-3 rounded-xl border px-4 py-3 sm:grid-cols-2">
      {single && isCardStatement && (
        <Field label="Tipo de pago">
          <Select
            value={single.kind}
            onValueChange={(kind) =>
              onSingle({ ...single, kind: kind as PayKind })
            }
          >
            <SelectTrigger aria-label="Tipo de pago">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAY_KINDS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      {single && !(isCardStatement && single.kind === "minimum") && (
        <Field label="Monto pagado" error={error ?? undefined}>
          <Input
            aria-label="Monto pagado"
            inputMode="decimal"
            placeholder="Saldo completo"
            value={single.amount}
            onChange={(e) => onSingle({ ...single, amount: e.target.value })}
          />
        </Field>
      )}
      <Field label="Fecha del pago">
        <Input
          aria-label="Fecha del pago"
          type="date"
          value={details.paidAt}
          onChange={(e) => set("paidAt", e.target.value)}
        />
      </Field>
      <Field label="Medio de pago">
        <Select
          value={details.method || NONE}
          onValueChange={(value) =>
            set("method", value === NONE ? "" : (value as PayMethod))
          }
        >
          <SelectTrigger aria-label="Medio de pago">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sin indicar</SelectItem>
            {PAY_METHODS.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Cuenta de salida">
        <Select
          value={details.accountId || NONE}
          onValueChange={(value) =>
            set("accountId", value === NONE ? "" : value)
          }
        >
          <SelectTrigger aria-label="Cuenta de salida">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sin indicar</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
                {account.bank ? ` · ${account.bank}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Nota">
          <Input
            aria-label="Nota"
            placeholder="Opcional"
            value={details.note}
            onChange={(e) => set("note", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}
