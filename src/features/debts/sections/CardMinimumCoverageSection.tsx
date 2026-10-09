import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { Card, CardContent } from "@/ui/card";

export type CardMinimumCoverage = {
  cardId: string;
  cardName: string;
  minimumDue: number;
  currentCharges: number;
  difference: number;
  covered: boolean;
  expensesByPerson: { personId: string; name: string; amount: number }[];
};

export function CardMinimumCoverageSection({
  items,
  month,
  year,
}: {
  items: CardMinimumCoverage[];
  month: number;
  year: number;
}) {
  return (
    <div className="grid items-start gap-3 sm:grid-cols-2 2xl:grid-cols-3">
      {items.map((item) => (
        <Card key={`minimum-coverage-${item.cardId}`}>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">
                  {item.cardName} · {getMonthName(month)} {year}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cargos del estado asignados, incluidos intereses
                </p>
              </div>
              <span
                className={`text-sm font-semibold ${item.covered ? "text-emerald-300" : "text-amber-300"}`}
              >
                {item.covered ? "Mínimo cubierto" : "Falta para el mínimo"}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-md bg-amber-500/10 p-2">
                <p className="text-xs text-muted-foreground">Pago mínimo</p>
                <p className="font-semibold tabular-nums text-amber-300">
                  {formatCurrency(item.minimumDue)}
                </p>
              </div>
              <div className="rounded-md bg-muted/40 p-2">
                <p className="text-xs text-muted-foreground">
                  Cargos + intereses
                </p>
                <p className="font-semibold tabular-nums">
                  {formatCurrency(item.currentCharges)}
                </p>
              </div>
              <div
                className={`rounded-md p-2 ${item.covered ? "bg-emerald-500/10" : "bg-amber-500/10"}`}
              >
                <p className="text-xs text-muted-foreground">
                  {item.covered ? "Excedente" : "Por cubrir"}
                </p>
                <p
                  className={`font-semibold tabular-nums ${item.covered ? "text-emerald-300" : "text-amber-300"}`}
                >
                  {formatCurrency(Math.abs(item.difference))}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {item.expensesByPerson.map((person) => (
                <span key={person.personId}>
                  {person.name}{" "}
                  <strong className="text-foreground tabular-nums">
                    {formatCurrency(person.amount)}
                  </strong>
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              La suma incluye los cargos e intereses de {item.cardName}. Se
              compara con el pago mínimo una sola vez y no se agrega a «Lo que
              debo».
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
