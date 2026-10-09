import { useState } from "react";
import { ChevronDown, Eye, PieChart as PieChartIcon } from "lucide-react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useCategories } from "@/shared/api/hooks/catalogs";
import type { CreditCardExpense } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";

const NO_CATEGORY_FILL = "var(--muted-foreground)";

interface CategoryGroup {
  key: string;
  name: string;
  fill: string;
  expenses: CreditCardExpense[];
  currencyTotals: Map<string, number>;
}

// Categorías del período para esta tarjeta. El gráfico conserva el total en soles;
// la lista y el sheet muestran cada moneda en su unidad original.
export function CardCategoryBreakdown({
  expenses,
}: {
  expenses: CreditCardExpense[];
}) {
  const categories = useCategories().data ?? [];
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const groupsByKey = new Map<string, CategoryGroup>();

  for (const expense of expenses) {
    const key = expense.categoryId ?? "none";
    let group = groupsByKey.get(key);
    if (!group) {
      const category = categories.find((item) => item.id === key);
      group = {
        key,
        name: category?.name ?? "Sin categoría",
        fill: category?.color ?? NO_CATEGORY_FILL,
        expenses: [],
        currencyTotals: new Map(),
      };
      groupsByKey.set(key, group);
    }
    group.expenses.push(expense);
    const currency = expense.currency || "PEN";
    group.currencyTotals.set(
      currency,
      (group.currencyTotals.get(currency) ?? 0) + expense.amount,
    );
  }

  const groups = [...groupsByKey.values()].sort((a, b) => {
    const solesDifference =
      (b.currencyTotals.get("PEN") ?? 0) - (a.currencyTotals.get("PEN") ?? 0);
    return (
      solesDifference ||
      (b.currencyTotals.get("USD") ?? 0) - (a.currencyTotals.get("USD") ?? 0)
    );
  });
  const categoryDetail = groups.find((group) => group.key === selectedCategory);
  const totalPEN = expenses
    .filter((expense) => (expense.currency || "PEN") === "PEN")
    .reduce((sum, expense) => sum + expense.amount, 0);
  const slices = groups
    .map((group) => ({
      key: group.key,
      name: group.name,
      value: group.currencyTotals.get("PEN") ?? 0,
      fill: group.fill,
    }))
    .filter((slice) => slice.value > 0);

  if (!groups.length) return null;

  const currencyAmounts = (totals: Map<string, number>) =>
    [...totals.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Consumo por categoría</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribución del consumo de este ciclo.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {groups.map((group) => {
              const expanded = expandedCategory === group.key;
              const amounts = currencyAmounts(group.currencyTotals);
              const panelId = `card-category-${group.key}`;
              return (
                <section
                  key={group.key}
                  className="overflow-hidden rounded-lg border bg-card"
                >
                  <div className="flex items-stretch">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() =>
                        setExpandedCategory(expanded ? null : group.key)
                      }
                    >
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${group.fill} 16%, transparent)`,
                          color: group.fill,
                        }}
                        aria-hidden="true"
                      >
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: group.fill }}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {group.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {group.expenses.length}{" "}
                          {group.expenses.length === 1 ? "consumo" : "consumos"}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-0.5">
                        {amounts.map(([currency, amount]) => (
                          <span
                            key={currency}
                            className="text-sm font-semibold tabular-nums"
                          >
                            {formatCurrency(amount, currency)}
                          </span>
                        ))}
                      </span>
                      <ChevronDown
                        className={`size-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="m-1.5 size-9 shrink-0 self-center"
                      aria-label={`Ver detalle de ${group.name}`}
                      title={`Ver detalle de ${group.name}`}
                      onClick={() => setSelectedCategory(group.key)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </div>
                  <div className="mx-3 mb-2 h-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${totalPEN ? Math.min(100, ((group.currencyTotals.get("PEN") ?? 0) / totalPEN) * 100) : 0}%`,
                        backgroundColor: group.fill,
                      }}
                    />
                  </div>
                  <ul
                    id={panelId}
                    hidden={!expanded}
                    className="divide-y border-t bg-muted/20 px-3"
                  >
                    {group.expenses
                      .slice()
                      .sort((a, b) =>
                        (b.processDate ?? "").localeCompare(
                          a.processDate ?? "",
                        ),
                      )
                      .map((expense) => (
                        <li
                          key={expense.id}
                          className="flex items-center justify-between gap-3 py-2.5 text-sm"
                        >
                          <span className="min-w-0">
                            <span className="block truncate">
                              {expense.description}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {expense.processDate
                                ? formatDate(expense.processDate)
                                : "Sin fecha"}
                              {expense.installment
                                ? ` · Cuota ${expense.installment}`
                                : ""}
                            </span>
                          </span>
                          <span className="shrink-0 font-medium tabular-nums">
                            {formatCurrency(
                              expense.amount,
                              expense.currency || "PEN",
                            )}
                          </span>
                        </li>
                      ))}
                  </ul>
                </section>
              );
            })}
          </CardContent>
        </Card>

        {slices.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="size-4 text-muted-foreground" />
                Distribución por categoría
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid items-center gap-4 md:grid-cols-[180px_1fr]">
                <div className="relative h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={slices}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={1}
                        stroke="var(--card)"
                        strokeWidth={2}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          const slice = active
                            ? (payload?.[0]?.payload as
                                (typeof slices)[number] | undefined)
                            : undefined;
                          if (!slice) return null;
                          return (
                            <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm">
                              <p className="font-medium text-popover-foreground">
                                {slice.name}
                              </p>
                              <p className="tabular-nums text-muted-foreground">
                                {formatCurrency(slice.value)}
                              </p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-base font-bold tabular-nums">
                      {formatCurrency(totalPEN)}
                    </span>
                  </div>
                </div>
                <ul className="space-y-1.5 text-sm">
                  {slices.map((slice) => (
                    <li
                      key={slice.key}
                      className="flex items-center justify-between gap-2 px-1 py-0.5"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-sm"
                          style={{ backgroundColor: slice.fill }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{slice.name}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {formatCurrency(slice.value)} ·{" "}
                        {totalPEN
                          ? Math.round((slice.value / totalPEN) * 100)
                          : 0}{" "}
                        %
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Categorías disponibles</CardTitle>
          <p className="text-sm text-muted-foreground">
            Categorías configuradas para clasificar tus movimientos.
          </p>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <span
                className="size-3 rounded-sm"
                style={{ backgroundColor: category.color }}
              />
              <span className="truncate">{category.name}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Sheet
        open={!!categoryDetail}
        onOpenChange={(open) => !open && setSelectedCategory(null)}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-xl"
        >
          {categoryDetail && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: categoryDetail.fill }}
                  />
                  {categoryDetail.name}
                </SheetTitle>
                <SheetDescription>
                  Detalle de consumos por categoría ·{" "}
                  {categoryDetail.expenses.length}{" "}
                  {categoryDetail.expenses.length === 1
                    ? "movimiento"
                    : "movimientos"}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {currencyAmounts(categoryDetail.currencyTotals).map(
                    ([currency, amount]) => (
                      <div
                        key={currency}
                        className="rounded-lg border bg-muted/30 p-3"
                      >
                        <p className="text-xs text-muted-foreground">
                          Total · {currency}
                        </p>
                        <p className="mt-1 text-lg font-semibold tabular-nums">
                          {formatCurrency(amount, currency)}
                        </p>
                      </div>
                    ),
                  )}
                </div>
                <ul className="divide-y rounded-lg border">
                  {categoryDetail.expenses
                    .slice()
                    .sort((a, b) =>
                      (b.processDate ?? "").localeCompare(a.processDate ?? ""),
                    )
                    .map((expense) => (
                      <li
                        key={expense.id}
                        className="flex items-center justify-between gap-3 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {expense.description}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {expense.processDate
                              ? formatDate(expense.processDate)
                              : "Sin fecha"}
                            {expense.installment
                              ? ` · Cuota ${expense.installment}`
                              : ""}
                          </p>
                          {expense.notes && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {expense.notes}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className="shrink-0 tabular-nums"
                        >
                          {formatCurrency(
                            expense.amount,
                            expense.currency || "PEN",
                          )}
                        </Badge>
                      </li>
                    ))}
                </ul>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
