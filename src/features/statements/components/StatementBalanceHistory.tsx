import type { Statement, StatementSummary } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";

function BalanceBreakdown({
  balances,
}: {
  balances: StatementSummary["balances"];
}) {
  return (
    <div className="space-y-3">
      {balances.map((balance) => {
        const money = (amount: number | null) =>
          amount == null
            ? "No identificado"
            : formatCurrency(amount, balance.currency);
        const remainder =
          balance.previousBalance != null && balance.previousPayments != null
            ? balance.previousBalance - balance.previousPayments
            : null;
        return (
          <div key={balance.currency} className="space-y-1 text-sm">
            <p className="font-medium">
              {balance.currency === "USD" ? "Dólares" : "Soles"}
            </p>
            <p className="text-muted-foreground">
              Saldo anterior {money(balance.previousBalance)} · Pagos{" "}
              {money(balance.previousPayments)}
            </p>
            <p>
              Remanente{" "}
              <strong className="tabular-nums">{money(remainder)}</strong> ·
              Pago del mes{" "}
              <strong className="tabular-nums">
                {money(balance.monthlyPayment)}
              </strong>
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function StatementBalanceHistory({
  statement,
  history,
}: {
  statement: Statement;
  history: StatementSummary[];
}) {
  return (
    <div className="space-y-3">
      <section className="rounded-lg border bg-muted/10 p-3">
        <h3 className="mb-3 text-sm font-medium">Desglose del estado</h3>
        <BalanceBreakdown balances={statement.balances} />
      </section>
      {history.length > 0 && (
        <details className="rounded-lg border p-3">
          <summary className="cursor-pointer text-sm font-medium">
            Estados anteriores
          </summary>
          <div className="mt-3 space-y-3">
            {history.map((item) => (
              <section key={item.id} className="space-y-2 border-t pt-3">
                <h4 className="text-sm font-medium">
                  {getMonthName(item.paymentMonth)} {item.paymentYear}
                </h4>
                {item.currencyReviewRequired ? (
                  <p className="text-xs text-muted-foreground">
                    Vuelve a cargar este PDF para revisar sus monedas.
                  </p>
                ) : (
                  <BalanceBreakdown balances={item.balances} />
                )}
              </section>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
