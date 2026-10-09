import { CheckCircle2, CircleHelp, XCircle } from "lucide-react";
import type { Statement } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
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
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-120 text-sm">
          <thead className="bg-muted/30 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Moneda</th>
              <th className="px-3 py-2 text-right font-medium">
                Total del banco
              </th>
              <th className="px-3 py-2 text-right font-medium">
                Registrado en Kogane
              </th>
              <th className="px-3 py-2 text-right font-medium">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {statement.balances.map((balance) => {
              const matches = totalsMatch(balance);
              const Icon =
                balance.difference == null
                  ? CircleHelp
                  : matches
                    ? CheckCircle2
                    : XCircle;
              return (
                <tr key={balance.currency} className="border-t">
                  <td className="px-3 py-2">
                    {CURRENCY_OPTIONS.find(
                      (item) => item.value === balance.currency,
                    )?.label ?? balance.currency}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {balance.totalDue == null
                      ? "No identificado"
                      : formatCurrency(balance.totalDue, balance.currency)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {formatCurrency(balance.koganeTotal, balance.currency)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-semibold tabular-nums ${balance.difference == null ? "text-muted-foreground" : matches ? "text-emerald-600" : "text-amber-600"}`}
                  >
                    <span className="inline-flex items-center justify-end gap-1">
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      {balance.difference == null
                        ? "—"
                        : formatCurrency(balance.difference, balance.currency)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
