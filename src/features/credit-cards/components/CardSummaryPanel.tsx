import { formatCurrency } from "@/shared/lib/currency";
import { formatDate, getMonthName } from "@/shared/lib/dates";
import type { CreditCardExpense, Statement } from "@/shared/api/types";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { latestMovements, topCategories } from "../lib/card-summary";

const amountOf = (expense: CreditCardExpense) =>
  expense.amountInPen ?? expense.amount;

/** Per-card summary (Resumen tab): latest movements, next payment and top categories. */
export function CardSummaryPanel({
  expenses,
  statement,
  month,
  year,
  payDay,
  closeDay,
  categoryName,
  personName,
  onSeeAll,
  onSeeCategories,
  onRegisterPayment,
}: {
  expenses: CreditCardExpense[];
  statement?: Statement;
  month: number;
  year: number;
  payDay: number | null;
  closeDay: number | null;
  categoryName: (id: string | null) => string;
  personName: (id: string | null | undefined) => string;
  onSeeAll: () => void;
  onSeeCategories: () => void;
  onRegisterPayment: () => void;
}) {
  const recent = latestMovements(expenses);
  const top = topCategories(expenses, categoryName);
  const balance =
    statement?.balances.find((item) => item.currency === "PEN") ??
    statement?.balances[0];
  const money = (value: number | null | undefined) =>
    value == null ? "—" : formatCurrency(value, balance?.currency ?? "PEN");

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <Card className="credit-card-surface">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <div>
            <CardTitle className="text-base">Últimos movimientos</CardTitle>
            <p className="text-xs text-muted-foreground">
              Los {recent.length || 5} más recientes del ciclo
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onSeeAll}>
            Ver todos
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length ? (
            <ul className="divide-y">
              {recent.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center gap-3 py-2.5 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {expense.description}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {expense.processDate
                        ? formatDate(expense.processDate)
                        : "—"}{" "}
                      · {categoryName(expense.categoryId ?? null)} ·{" "}
                      {personName(expense.personId)}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(amountOf(expense))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Sin movimientos en {getMonthName(month).toLowerCase()}.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="credit-card-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Próximo pago</CardTitle>
            <p className="text-xs text-muted-foreground">
              {getMonthName(month)} {year}
              {payDay ? ` · vence día ${payDay}` : ""}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Pago total del mes</dt>
                <dd className="font-semibold tabular-nums">
                  {money(balance?.totalDue)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Pago mínimo</dt>
                <dd className="tabular-nums">{money(balance?.minimumDue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cierre del ciclo</dt>
                <dd>{closeDay ? `día ${closeDay}` : "—"}</dd>
              </div>
            </dl>
            <Button size="sm" className="w-full" onClick={onRegisterPayment}>
              Registrar pago
            </Button>
          </CardContent>
        </Card>

        <Card className="credit-card-surface">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <div>
              <CardTitle className="text-base">Por categoría</CardTitle>
              <p className="text-xs text-muted-foreground">Top 3 del ciclo</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onSeeCategories}>
              Ver categorías
            </Button>
          </CardHeader>
          <CardContent>
            {top.length ? (
              <ul className="space-y-1.5 text-sm">
                {top.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span className="truncate">{item.name}</span>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(item.total)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sin categorías.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
