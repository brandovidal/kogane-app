import { useEffect, useState } from "react";
import { useBudgetGroups } from "@/shared/api/hooks/catalogs";
import { useSetBudget, useSummary } from "@/shared/api/hooks/summary";
import { withQuery } from "@/shared/api/query";
import { getMonthName } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Save, DollarSign, PieChart, Palette } from "lucide-react";
import { AccountsTable } from "./AccountsTable";
import { PeopleTable } from "./PeopleTable";
import { NotificationSettingsCard } from "./NotificationSettingsCard";
import { formatCurrency } from "@/shared/lib/currency";

// Salary and limit are per month (bud_monthly_budgets): this edits the month on screen
function SettingsPageView() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const summary = useSummary(month, year).data;
  const budgetGroups = useBudgetGroups().data ?? [];
  const setBudget = useSetBudget();
  const salary = summary?.budget?.salary ?? 0;
  const budgetLimitPercent = summary?.budget?.limitPercent ?? 100;

  const [salaryInput, setSalaryInput] = useState(salary.toString());
  const [limitInput, setLimitInput] = useState(budgetLimitPercent.toString());

  useEffect(() => {
    setSalaryInput(salary.toString());
    setLimitInput(budgetLimitPercent.toString());
  }, [salary, budgetLimitPercent]);

  const handleSaveSalary = () => {
    const val = parseFloat(salaryInput);
    const lim = parseFloat(limitInput);
    if (isNaN(val) || val <= 0 || isNaN(lim) || lim <= 0 || lim > 100) return;
    setBudget.mutate({ month, year, salary: val, limitPercent: lim });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Sueldo y Presupuesto */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4" />
            Sueldo y Presupuesto · {getMonthName(month)} {year}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Sueldo mensual</label>
              <Input
                type="number"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                placeholder="5000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Límite presupuesto (%)</label>
              <Input
                type="number"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                placeholder="100"
              />
            </div>
          </div>
          <Button size="sm" onClick={handleSaveSalary} disabled={setBudget.isPending}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Guardar
          </Button>
        </CardContent>
      </Card>

      {/* Grupos de Presupuesto */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChart className="h-4 w-4" />
            Grupos de Presupuesto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {budgetGroups
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((group) => (
              <div key={group.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <span>{group.emoji}</span>
                  <span className="text-sm font-medium">{group.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{group.percentage}%</span>
                  <span className="text-sm font-medium">{formatCurrency((salary * group.percentage) / 100)}</span>
                </div>
              </div>
            ))}
          <p className="text-xs text-muted-foreground">
            Edita los grupos en la página de{" "}
            <a href="/relacion-gastos" className="text-primary underline">Relación de Gastos</a>
          </p>
        </CardContent>
      </Card>

      <PeopleTable />
      <AccountsTable />
      <NotificationSettingsCard />

      {/* Preferencias */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Preferencias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tema</p>
              <p className="text-xs text-muted-foreground">Usa el toggle en la barra superior para cambiar el tema</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Moneda predeterminada</p>
              <p className="text-xs text-muted-foreground">PEN (Soles peruanos)</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export const SettingsPage = withQuery(SettingsPageView);
