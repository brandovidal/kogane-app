import { StatementMinimumCard } from "@/features/credit-cards/components/StatementMinimumCard";
import { getMonthName } from "@/shared/lib/dates";
import { Card, CardContent } from "@/ui/card";

export function StatementMinimumSection({
  cards,
  isLoading,
  hasCreditCards,
  month,
  year,
}: {
  cards: { id: string; name: string }[];
  isLoading: boolean;
  hasCreditCards: boolean;
  month: number;
  year: number;
}) {
  return (
    <div className="grid items-start gap-3">
      {cards.map((card) => (
        <StatementMinimumCard
          key={card.id}
          paymentMethodId={card.id}
          cardName={card.name}
          month={month}
          year={year}
        />
      ))}
      {isLoading && cards.length === 0 && (
        <Card><CardContent className="p-4 text-sm text-muted-foreground">Buscando estados de cuenta…</CardContent></Card>
      )}
      {!isLoading && cards.length === 0 && (
        <Card><CardContent className="p-4 text-sm text-muted-foreground">
          {hasCreditCards
            ? <>No hay estados de cuenta de tarjetas para {getMonthName(month)} {year}. <a className="underline underline-offset-4" href="/importacion">Cargar estado de cuenta</a></>
            : "No hay tarjetas de crédito incluidas en los filtros actuales."}
        </CardContent></Card>
      )}
    </div>
  );
}
