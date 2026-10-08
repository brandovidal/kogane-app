import { useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { Summary } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { BudgetCategoryDetail } from "./BudgetCategoryDetail";

import {
  donutSlices,
  type DonutMode,
  type DonutSlice,
} from "@/features/budget/lib/budget-view";

export function BudgetDonut({
  summary,
  month,
  year,
}: {
  summary: Summary | undefined;
  month: number;
  year: number;
}) {
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
          <p className="py-16 text-center text-sm text-muted-foreground">
            Sin gastos en este mes
          </p>
        ) : (
          <div className="grid items-center gap-4 md:grid-cols-[240px_1fr]">
            <div className="relative h-60">
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
                    onClick={(_, index) =>
                      mode === "categories" && setSelected(slices[index])
                    }
                    className={
                      mode === "categories" ? "cursor-pointer" : undefined
                    }
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      const slice = active
                        ? (payload?.[0]?.payload as DonutSlice | undefined)
                        : undefined;
                      if (!slice) return null;
                      return (
                        <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-sm">
                          <p className="font-medium text-foreground">
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
                <span className="text-xs text-muted-foreground">
                  Total gastado
                </span>
                <span className="text-lg font-bold tabular-nums">
                  {formatCurrency(summary?.spentPen ?? 0)}
                </span>
                {surplus != null && (
                  <span
                    className={`text-xs tabular-nums ${surplus < 0 ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    Excedente {formatCurrency(surplus)}
                  </span>
                )}
              </div>
            </div>
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
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: slice.fill }}
                        aria-hidden
                      />
                      {slice.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatCurrency(slice.value)} ·{" "}
                      {summary?.spentPen
                        ? Math.round((slice.value / summary.spentPen) * 100)
                        : 0}{" "}
                      %
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <BudgetCategoryDetail
        slice={selected}
        month={month}
        year={year}
        onClose={() => setSelected(null)}
      />
    </Card>
  );
}
