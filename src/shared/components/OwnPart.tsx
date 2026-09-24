import { formatCurrency } from "@/shared/lib/currency";

// Under a total: "tu parte S/ …" when something in the list is shared (D73); nothing otherwise
export function OwnPart({ paid, own }: { paid: number; own: number }) {
  if (Math.abs(paid - own) < 0.005) return null;
  return <p className="text-xs text-muted-foreground">👥 tu parte {formatCurrency(own)} · otros {formatCurrency(paid - own)}</p>;
}
