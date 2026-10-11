import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useSummaryHistory } from "@/features/budget/hooks/summary";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

// Excedente por mes (D78): polarity, so positive and negative months get their own color around a zero line
export function SurplusTrend({ month, year }: { month: number; year: number }) {
  const [range, setRange] = useState<3 | 6 | 12 | "year">(6);
  const months = range === "year" ? month : range;
  const history = useSummaryHistory(month, year, months).data ?? [];
  const data = history.map((item) => ({
    name: `${getMonthName(item.month).slice(0, 3)} ${String(item.year).slice(2)}`,
    positive: item.surplus != null && item.surplus >= 0 ? item.surplus : 0,
    negative: item.surplus != null && item.surplus < 0 ? item.surplus : 0,
    surplus: item.surplus,
    spent: item.spentPen,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
        <CardTitle className="text-base">Excedente por mes</CardTitle>
        <div
          className="flex rounded-lg border bg-muted/40 p-0.5"
          role="group"
          aria-label="Período del gráfico"
        >
          {([3, 6, 12, "year"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={range === option}
              onClick={() => setRange(option)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${range === option ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {option === "year" ? "Año" : `${option} m`}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--muted-foreground)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="var(--muted-foreground)"
              width={56}
            />
            <ReferenceLine y={0} stroke="var(--muted-foreground)" />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              content={({ active, payload }) => {
                const row = active
                  ? (payload?.[0]?.payload as (typeof data)[number] | undefined)
                  : undefined;
                if (!row) return null;
                return (
                  <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-sm">
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className="text-muted-foreground">
                      Excedente:{" "}
                      <span className="text-foreground tabular-nums">
                        {row.surplus == null
                          ? "sin sueldo"
                          : formatCurrency(row.surplus)}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Gastado:{" "}
                      <span className="text-foreground tabular-nums">
                        {formatCurrency(row.spent)}
                      </span>
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="positive"
              stackId="surplus"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="negative"
              stackId="surplus"
              fill="var(--destructive)"
              radius={[0, 0, 4, 4]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
