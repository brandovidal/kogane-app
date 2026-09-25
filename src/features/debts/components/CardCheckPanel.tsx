import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { useCardCheck } from "@/shared/api/hooks/debts";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

// Contraste con la tarjeta (D114): what others owe of this card and month next to what the bank billed. The
// "sin explicar" is what the statement asks beyond the card expenses registered: interest, fees or a missing charge
export function CardCheckPanel({ cardId, cardName, month, year }: { cardId: string; cardName: string; month: number; year: number }) {
  const { data: check } = useCardCheck({ paymentMethodId: cardId, month, year });
  if (!check) return null;
  const unexplained = check.unexplained ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Estado de cuenta {cardName} · {getMonthName(month)} {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!check.statementId ? (
          <p className="text-muted-foreground">
            Todavía no subes el estado de cuenta de este mes.{" "}
            <a className="underline" href="/reconocimiento">
              Súbelo en Reconocimiento
            </a>{" "}
            para contrastarlo.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Total del banco</p>
              <p className="font-semibold tabular-nums">{formatCurrency(check.statementTotal ?? 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Registrado en Kogane</p>
              <p className="font-semibold tabular-nums">{formatCurrency(check.koganeTotal)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sin explicar</p>
              <p
                className={`flex items-center gap-1 font-semibold tabular-nums ${Math.abs(unexplained) < 0.01 ? "text-emerald-600" : "text-amber-600"}`}
              >
                {Math.abs(unexplained) < 0.01 ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {formatCurrency(unexplained)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Te deben de esta tarjeta</p>
              <p className="font-semibold tabular-nums">
                {formatCurrency(check.othersOwed - check.othersPaid)}{" "}
                <span className="text-xs font-normal text-muted-foreground">de {formatCurrency(check.othersOwed)}</span>
              </p>
            </div>
          </div>
        )}

        {check.people.length > 0 && (
          <div className="space-y-1 border-t pt-2">
            {check.people.map((person) => (
              <div key={person.personId} className="flex justify-between gap-2">
                <span>{person.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  pagó {formatCurrency(person.paid)} de {formatCurrency(person.owed)} ·{" "}
                  <span className={person.balance > 0 ? "font-medium text-foreground" : ""}>saldo {formatCurrency(person.balance)}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {check.possibleInterest.length > 0 && (
          <div className="rounded-md bg-amber-50 p-2 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <p className="font-medium">Posibles intereses o comisiones</p>
            {check.possibleInterest.map((line, index) => (
              <p key={index} className="flex justify-between gap-2">
                <span>{line.description}</span>
                <span className="tabular-nums">{formatCurrency(line.amount)}</span>
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
