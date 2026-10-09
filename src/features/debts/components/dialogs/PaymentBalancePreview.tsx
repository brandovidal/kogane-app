import { formatCurrency } from "@/shared/lib/currency";
import { Badge } from "@/ui/badge";
import {
  PAYMENT_OUTCOME_LABELS,
  previewPayment,
} from "../../lib/payment-preview";

/** Saldo actual → Este pago → Saldo después del pago, with the status the debt will have. */
export function PaymentBalancePreview({
  balance,
  amount,
  currency = "PEN",
}: {
  balance: number;
  amount: number;
  currency?: string;
}) {
  const preview = previewPayment(balance, amount);
  return (
    <dl
      aria-label="Resumen del pago"
      className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-sm"
    >
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Saldo actual</dt>
        <dd className="tabular-nums">
          {formatCurrency(preview.current, currency)}
        </dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Este pago</dt>
        <dd className="tabular-nums">
          − {formatCurrency(preview.applied, currency)}
        </dd>
      </div>
      <div className="flex items-center justify-between border-t pt-1.5 font-medium">
        <dt>Saldo después del pago</dt>
        <dd className="flex items-center gap-2 tabular-nums">
          {formatCurrency(preview.after, currency)}
          <Badge variant={preview.outcome === "paid" ? "default" : "secondary"}>
            {PAYMENT_OUTCOME_LABELS[preview.outcome]}
          </Badge>
        </dd>
      </div>
    </dl>
  );
}
