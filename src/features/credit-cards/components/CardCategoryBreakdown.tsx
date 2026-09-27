import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useCategories } from "@/shared/api/hooks/catalogs";
import type { CreditCardExpense } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

const NO_CATEGORY_FILL = "var(--muted-foreground)";

// Detalle por categoría de una tarjeta, en soles (D73): igual estilo que el donut de Presupuesto, pero sobre los
// gastos ya cargados de esta tarjeta y este mes, sin depender del Summary de todo el presupuesto
export function CardCategoryBreakdown({ expenses }: { expenses: CreditCardExpense[] }) {
  const categories = useCategories().data ?? [];
  const byCategory = new Map<string, number>();
  for (const expense of expenses) {
    if (expense.currency !== "PEN") continue; // como el resto de gráficos de presupuesto (D71)
    const key = expense.categoryId ?? "none";
    byCategory.set(key, (byCategory.get(key) ?? 0) + expense.amount);
  }
  const total = [...byCategory.values()].reduce((sum, amount) => sum + amount, 0);
  const slices = [...byCategory]
    .filter(([, value]) => value > 0)
    .map(([key, value]) => {
      const category = categories.find((item) => item.id === key);
      return { key, name: category?.name ?? "Sin categoría", value, fill: category?.color ?? NO_CATEGORY_FILL };
    })
    .sort((a, b) => b.value - a.value);

  if (!slices.length) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Detalle por categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid items-center gap-4 md:grid-cols-[200px_1fr]">
          <div className="relative h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={1}
                  stroke="var(--card)"
                  strokeWidth={2}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    const slice = active ? (payload?.[0]?.payload as (typeof slices)[number] | undefined) : undefined;
                    if (!slice) return null;
                    return (
                      <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-sm">
                        <p className="font-medium text-foreground">{slice.name}</p>
                        <p className="tabular-nums text-muted-foreground">{formatCurrency(slice.value)}</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-muted-foreground">Total (soles)</span>
              <span className="text-lg font-bold tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>
          <ul className="space-y-1.5 text-sm">
            {slices.map((slice) => (
              <li key={slice.key} className="flex items-center justify-between gap-2 px-1 py-0.5">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: slice.fill }} aria-hidden />
                  {slice.name}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCurrency(slice.value)} · {total ? Math.round((slice.value / total) * 100) : 0} %
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
