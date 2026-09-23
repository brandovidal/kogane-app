import { useDashboard } from "@/features/dashboard/dashboard.service";
import { withQuery } from "@/shared/api/query";
import { usePeriod } from "@/shared/stores/period.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Separator } from "@/ui/separator";
import { Badge } from "@/ui/badge";
import { formatCurrency } from "@/shared/lib/currency";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

function SummaryOverviewView() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const { summary, creditCards: cardTotals } = useDashboard(month, year);

  const { salary, surplus, totalExpenses, totalNecesario, totalConCulpa } = summary;
  const totalFC = summary.totalFixedCosts;
  const totalSubs = summary.totalSubscriptions;

  const breakdownData = [
    { name: "Costos Fijos", monto: totalFC },
    { name: "Suscripciones", monto: totalSubs },
    ...cardTotals.map((c) => ({ name: c.name, monto: c.total })),
  ];

  return (
    <div className="space-y-6">
      {/* Main summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Sueldo</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{formatCurrency(salary)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-red-500">{formatCurrency(totalExpenses)}</span>
            <p className="text-xs text-muted-foreground">
              {salary > 0 ? `${((totalExpenses / salary) * 100).toFixed(1)}% del sueldo` : "Sin sueldo registrado"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Excedente</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold ${surplus >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatCurrency(surplus)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Desglose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Costos Fijos</span>
              <span className="font-semibold">{formatCurrency(totalFC)}</span>
            </div>
            <div className="flex justify-between">
              <span>Suscripciones</span>
              <span className="font-semibold">{formatCurrency(totalSubs)}</span>
            </div>
            <Separator />
            {cardTotals.map((c) => (
              <div key={c.code} className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color ?? "#6B7280" }} />
                  <span>{c.name}</span>
                </div>
                <span className="font-semibold">{formatCurrency(c.total)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(totalExpenses)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Necesario vs Con Culpa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Necesario</Badge>
              </div>
              <span className="font-semibold">{formatCurrency(totalNecesario)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">Con culpa</Badge>
              </div>
              <span className="font-semibold">{formatCurrency(totalConCulpa)}</span>
            </div>
            <Separator />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={breakdownData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="monto" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const SummaryOverview = withQuery(SummaryOverviewView);
