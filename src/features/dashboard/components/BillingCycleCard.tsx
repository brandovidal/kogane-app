import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { formatCurrency } from "@/shared/lib/currency";
import { CreditCard } from "lucide-react";
import { type CreditCardSummary } from "@/features/dashboard/services/dashboard.service";

interface BillingCycleCardProps {
  cards: CreditCardSummary[];
}

export function BillingCycleCard({ cards }: BillingCycleCardProps) {
  // Astro's server has no client query cache. A page navigation can retain the
  // browser QueryClient, so cards can already exist on the client's first
  // render even though the server rendered an empty array. Keep the same
  // initial markup on both sides, then reveal the data after hydration.
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    setToday(new Date().getDate());
    setMounted(true);
  }, []);
  const visibleCards = mounted ? cards : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <CreditCard className="h-4 w-4" />
          Tarjetas de Crédito
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 pt-0">
        {visibleCards.map((card) => {
          const daysUntilDue =
            today == null
              ? null
              : card.paymentDueDay >= today
                ? card.paymentDueDay - today
                : 30 - today + card.paymentDueDay;
          const isUrgent = daysUntilDue != null && daysUntilDue <= 5;

          return (
            <div
              key={card.code}
              className="flex items-center justify-between py-1.5"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: card.color ?? "#6B7280" }}
                />
                <span className="text-sm">{card.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {formatCurrency(card.total)}
                </span>
                {isUrgent && card.total > 0 && daysUntilDue != null && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0">
                    {daysUntilDue}d
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
        <div className="flex justify-between border-t pt-2">
          <span className="text-xs font-medium text-muted-foreground">
            Total
          </span>
          <span className="text-sm font-bold">
            {formatCurrency(visibleCards.reduce((sum, c) => sum + c.total, 0))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
