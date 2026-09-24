import { useCreditCards } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/shared/api/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { usePeriod } from "@/shared/stores/period.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { formatCurrency } from "@/shared/lib/currency";
import { CreditCard, ArrowRight, Calendar } from "lucide-react";

function CreditCardOverviewView() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const creditCards = useCreditCards().data ?? [];
  const expenses = useExpenses(EXPENSE_RESOURCES.creditCard, { month, year }, { byPerson: true }).data ?? [];

  const cardSummaries = creditCards.map((card) => {
    const cardExpenses = expenses.filter((e) => e.paymentMethodId === card.id);
    const total = cardExpenses.reduce((sum, e) => sum + (e.amountInPen ?? e.amount), 0);
    const pending = cardExpenses.filter((e) => e.paymentStatus === "pending").length;
    const paid = cardExpenses.filter((e) => e.paymentStatus === "paid").length;

    return {
      ...card,
      billingCloseDay: card.billingCloseDay ?? 0,
      paymentDueDay: card.paymentDueDay ?? 0,
      total,
      count: cardExpenses.length,
      pending,
      paid,
    };
  });

  const grandTotal = cardSummaries.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Tarjetas</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{formatCurrency(grandTotal)}</span>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.length} movimientos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Próximos vencimientos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cardSummaries
              .filter((c) => c.total > 0)
              .sort((a, b) => a.paymentDueDay - b.paymentDueDay)
              .map((card) => (
                <div key={card.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Día {card.paymentDueDay}</span>
                  </div>
                  <span className="font-medium">{card.name}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {cardSummaries.map((card) => (
          <Card key={card.id} className="overflow-hidden">
            <div className="h-1.5" style={{ backgroundColor: card.color ?? "#6B7280" }} />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${card.color}20` }}
                  >
                    <CreditCard className="h-5 w-5" style={{ color: card.color ?? "#6B7280" }} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{card.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {card.billingCloseDay ? `Cierre: día ${card.billingCloseDay} | Pago: día ${card.paymentDueDay}` : "Sin días de cierre y pago"}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold">{formatCurrency(card.total)}</div>
              <div className="flex gap-2">
                <Badge variant="outline">{card.count} movimientos</Badge>
                {card.pending > 0 && (
                  <Badge variant="secondary">{card.pending} pendientes</Badge>
                )}
                {card.paid > 0 && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {card.paid} pagados
                  </Badge>
                )}
              </div>
              <a
                href={`/tarjetas/${card.code ?? card.id}`}
                className="flex items-center gap-1 text-sm text-primary hover:underline mt-2"
              >
                Ver detalle <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const CreditCardOverview = withQuery(CreditCardOverviewView);
