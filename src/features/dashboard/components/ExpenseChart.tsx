import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { getMonthName } from "@/shared/lib/dates";

interface ExpenseChartProps {
  data: Array<{
    month: number;
    year: number;
    totalExpenses: number;
    salary: number;
    surplus: number;
  }>;
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const chartData = data.map((d) => ({
    name: getMonthName(d.month).slice(0, 3),
    gastos: d.totalExpenses,
    excedente: d.surplus > 0 ? d.surplus : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="gastos" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="excedente" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
