import { formatCurrency } from "@/shared/lib/currency";
import { paidAndOwn } from "@/shared/lib/shared-expense";

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  amountInPEN?: number | null;
  othersShare?: number | null; // shared (D73): what others owe of it, shown under the amount
  className?: string;
}

function Amount({ amount, currency = "PEN", amountInPEN, className }: CurrencyDisplayProps) {
  if (currency !== "PEN" && amountInPEN) {
    return (
      <div className={className}>
        <span className="font-semibold">{formatCurrency(amountInPEN)}</span>
        <span className="text-xs text-muted-foreground ml-1">
          ({formatCurrency(amount, currency)})
        </span>
      </div>
    );
  }
  return <span className={`font-semibold ${className ?? ""}`}>{formatCurrency(amount, currency)}</span>;
}

// The amount paid; for a shared expense also "👥 otros S/ 32.00 · tu parte S/ 32.00"
export function CurrencyDisplay(props: CurrencyDisplayProps) {
  if (!props.othersShare) return <Amount {...props} />;
  const { paid, own } = paidAndOwn({ amount: props.amount, amountInPen: props.amountInPEN, othersShare: props.othersShare });
  return (
    <div>
      <Amount {...props} />
      <div className="text-xs text-muted-foreground">
        👥 otros {formatCurrency(paid - own)} · tu parte {formatCurrency(own)}
      </div>
    </div>
  );
}
