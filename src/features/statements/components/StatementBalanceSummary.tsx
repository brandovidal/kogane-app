import { CheckCircle2, CircleHelp, XCircle } from "lucide-react";
import type { Statement } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { CURRENCY_OPTIONS } from "@/shared/constants/currency";
import { totalsMatch } from "../lib/statement-view";

export function StatementBalanceSummary({
  statement,
}: {
  statement: Statement;
}) {
  return (
    <div className="space-y-3 pt-2">
      {statement.currencyReviewRequired && (
        <p
          role="status"
          className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300"
        >
          Este estado se leyó antes de separar soles y dólares. Vuelve a cargar
          el PDF para reconocer los saldos por moneda y revisa los gastos ya
          guardados.
        </p>
      )}
      <div className="grid gap-3 xl:grid-cols-2">
        {statement.balances.map((balance) => {
          const matches = totalsMatch(balance);
          const Icon =
            balance.difference == null
              ? CircleHelp
              : matches
                ? CheckCircle2
                : XCircle;
          return (
            <section
              key={balance.currency}
              className="min-w-0 rounded-lg border bg-muted/10 p-3"
            >
              <h3 className="mb-3 text-sm font-medium">
                {CURRENCY_OPTIONS.find(
                  (item) => item.value === balance.currency,
                )?.label ?? balance.currency}
              </h3>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Total del banco
                  </dt>
                  <dd className="mt-1 font-semibold tabular-nums">
                    {balance.totalDue == null
                      ? "No identificado"
                      : formatCurrency(balance.totalDue, balance.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Registrado en Kogane
                  </dt>
                  <dd className="mt-1 font-semibold tabular-nums">
                    {formatCurrency(balance.koganeTotal, balance.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Diferencia</dt>
                  <dd
                    className={`mt-1 flex items-center gap-1 font-semibold tabular-nums ${balance.difference == null ? "text-muted-foreground" : matches ? "text-emerald-600" : "text-amber-600"}`}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {balance.difference == null
                      ? "—"
                      : formatCurrency(balance.difference, balance.currency)}
                  </dd>
                </div>
              </dl>
            </section>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Pagar hasta{" "}
        <span className="font-medium text-foreground">
          {statement.dueDate ? formatDate(statement.dueDate) : "Sin fecha"}
        </span>{" "}
        · Los saldos se comparan en su moneda original.
      </p>
    </div>
  );
}
