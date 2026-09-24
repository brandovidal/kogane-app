import { useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { usePeople } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/shared/api/hooks/expenses";
import { EXPENSE_RESOURCES, type Summary } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { paidAndOwn } from "@/shared/lib/shared-expense";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/ui/sheet";

import { donutSlices, type DonutMode, type DonutSlice } from "../budget-view";

// Donut like the Resumen of Notion (D78): total spent and surplus in the middle, one slice per category (or group);
// a slice opens what was spent in it
export function BudgetDonut({ summary, month, year }: { summary: Summary | undefined; month: number; year: number }) {
  const [mode, setMode] = useState<DonutMode>("categories");
  const [selected, setSelected] = useState<DonutSlice | null>(null);
  const slices = donutSlices(summary, mode);
  const surplus = summary?.surplus;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">¿En qué se fue?</CardTitle>
        <div className="flex rounded-md border p-0.5 text-xs">
          {(["categories", "groups"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`rounded px-2 py-1 ${mode === option ? "bg-muted font-medium" : "text-muted-foreground"}`}
            >
              {option === "categories" ? "Categorías" : "Grupos"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {!slices.length ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Sin gastos en este mes</p>
        ) : (
          <div className="grid items-center gap-4 md:grid-cols-[240px_1fr]">
            <div className="relative h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={1}
                    stroke="var(--card)"
                    strokeWidth={2}
                    onClick={(_, index) => mode === "categories" && setSelected(slices[index])}
                    className={mode === "categories" ? "cursor-pointer" : undefined}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      const slice = active ? (payload?.[0]?.payload as DonutSlice | undefined) : undefined;
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
                <span className="text-xs text-muted-foreground">Total gastado</span>
                <span className="text-lg font-bold tabular-nums">{formatCurrency(summary?.spentPen ?? 0)}</span>
                {surplus != null && (
                  <span className={`text-xs tabular-nums ${surplus < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    Excedente {formatCurrency(surplus)}
                  </span>
                )}
              </div>
            </div>
            {/* Legend with values: identity never by color alone */}
            <ul className="space-y-1.5 text-sm">
              {slices.map((slice) => (
                <li key={slice.key}>
                  <button
                    type="button"
                    disabled={mode !== "categories"}
                    onClick={() => setSelected(slice)}
                    className="flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 text-left hover:bg-muted/50 disabled:hover:bg-transparent"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: slice.fill }} aria-hidden />
                      {slice.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatCurrency(slice.value)} · {summary?.spentPen ? Math.round((slice.value / summary.spentPen) * 100) : 0} %
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CategoryDetail slice={selected} month={month} year={year} onClose={() => setSelected(null)} />
    </Card>
  );
}

// What was spent in one category this month, your part (D71, D73)
function CategoryDetail({ slice, month, year, onClose }: { slice: DonutSlice | null; month: number; year: number; onClose: () => void }) {
  const period = { month, year };
  const me = usePeople().data?.find((person) => person.isDefault)?.id;
  const daily = useExpenses(EXPENSE_RESOURCES.daily, period).data ?? [];
  const fixed = useExpenses(EXPENSE_RESOURCES.fixedCost, period).data ?? [];
  const cards = useExpenses(EXPENSE_RESOURCES.creditCard, period).data ?? [];
  const categoryId = slice?.key === "none" ? null : slice?.key;
  const rows = [
    ...daily.map((item) => ({ ...item, when: item.spentAt })),
    ...fixed.map((item) => ({ ...item, when: item.paymentDate ?? null })),
    ...cards.map((item) => ({ ...item, when: item.processDate ?? null })),
  ]
    .filter((item) => item.personId === me && (item.categoryId ?? null) === categoryId && item.currency === "PEN")
    .sort((a, b) => (b.when ?? "").localeCompare(a.when ?? ""));

  return (
    <Sheet open={!!slice} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{slice?.name}</SheetTitle>
        </SheetHeader>
        <ul className="space-y-2 px-4 pb-4 text-sm">
          {rows.map((row) => (
            <li key={row.id} className="flex items-start justify-between gap-2 border-b pb-2">
              <div>
                <p className="font-medium">{row.description}</p>
                <p className="text-xs text-muted-foreground">{row.when ? formatDate(row.when) : "—"}</p>
              </div>
              <span className="tabular-nums">{formatCurrency(paidAndOwn(row).own)}</span>
            </li>
          ))}
          {!rows.length && <li className="text-muted-foreground">Sin gastos</li>}
        </ul>
        <div className="px-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
