import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { Debt } from "@/shared/api/types";
import { buildCollectSummaryMessage } from "@/features/debts/lib/debt-filters";
import { Button } from "@/ui/button";

export function CollectButton({
  name,
  debts,
  cardNames,
  additionalCharges = [],
  summaryDebts,
  personalExpenses = [],
}: {
  name: string;
  debts: Debt[];
  cardNames: Map<string, string>;
  additionalCharges?: {
    description: string;
    amount: number;
    periodMonth: number;
    periodYear: number;
  }[];
  summaryDebts?: Debt[];
  personalExpenses?: { description: string; amount: number; source: string }[];
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        buildCollectSummaryMessage(
          name,
          debts,
          cardNames,
          additionalCharges,
          summaryDebts ? { debts: summaryDebts, personalExpenses } : undefined,
        ),
      );
      toast.success(`Mensaje para ${name} copiado`);
    } catch {
      toast.error("No pude copiar el mensaje");
    }
  };
  if (
    !debts.length &&
    !additionalCharges.length &&
    !summaryDebts?.length &&
    !personalExpenses.length
  )
    return null;
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void copy();
      }}
    >
      <MessageCircle className="mr-1 h-4 w-4" /> Cobrar
    </Button>
  );
}
