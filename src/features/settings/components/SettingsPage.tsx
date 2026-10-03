import { useEffect, useState } from "react";
import { useBudgetGroups } from "@/shared/api/hooks/catalogs";
import { useBudgetSettings, useSaveBudgetSettings, useSummary } from "@/features/budget/hooks/summary";
import { incomesHref } from "@/features/incomes/lib/income-links";
import { withQuery } from "@/shared/api/query";
import { getMonthName } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Switch } from "@/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { ArrowUpRight, DollarSign, PieChart, Palette } from "lucide-react";
import { AccountsTable } from "./AccountsTable";
import { PeopleTable } from "./PeopleTable";
import { NotificationSettingsCard } from "./NotificationSettingsCard";
import { UsersPanel } from "@/features/auth/components/UsersPanel";
import { HistoryPanel } from "@/features/history/components/HistoryPanel";
import { useMe } from "@/features/auth/hooks/auth";
import { formatCurrency } from "@/shared/lib/currency";

const TABS = [
  ["presupuesto", "Presupuesto"],
  ["grupos", "Grupos"],
  ["personas", "Personas"],
  ["cuentas", "Cuentas y tarjetas"],
  ["notificaciones", "Notificaciones"],
  ["historial", "Historial"],
  ["usuarios", "Usuarios"], // admins only (P23)
] as const;
type SettingsTab = (typeof TABS)[number][0];

// The open tab lives in the URL (?tab=cuentas), so a link or a reload comes back to it (D98)
function useTabInUrl(): [SettingsTab, (tab: SettingsTab) => void] {
  const [tab, setTab] = useState<SettingsTab>("presupuesto");
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (TABS.some(([key]) => key === fromUrl)) setTab(fromUrl as SettingsTab);
  }, []);
  const change = (next: SettingsTab) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  };
  return [tab, change];
}

// D96: what else adds to the Relación de gastos. Fixed costs and cards always do; a subscription paid with a credit
// card never does (the card charge already counts, D46)
function BudgetSwitches() {
  const { data } = useBudgetSettings();
  const save = useSaveBudgetSettings();
  const row = (key: "recurringCount" | "platformsCount", title: string, help: string) => (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{help}</p>
      </div>
      <Switch
        checked={data?.[key] ?? false}
        disabled={!data || save.isPending}
        aria-label={title}
        onCheckedChange={(checked) => save.mutate({ [key]: checked })}
      />
    </div>
  );
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Qué suma al presupuesto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {row("recurringCount", "Recurrentes suman", "Servicios (Bitel, Enel, internet), anuales y otros cuentan en el grupo de su categoría.")}
        {row("platformsCount", "Plataformas suman", "Netflix, HBO, Spotify… Apagado, como en tu Resumen de Notion: ya cuentan en el cargo de la tarjeta.")}
        <p className="text-xs text-muted-foreground">
          Costos fijos, tarjetas y día a día siempre suman. Lo pagado con tarjeta de crédito nunca se cuenta dos veces.
        </p>
      </CardContent>
    </Card>
  );
}

// Income editing lives in Ingresos; this page configures the budget and catalogs.
function SettingsPageView() {
  const [tab, setTab] = useTabInUrl();
  const { data: me } = useMe();
  const isAdmin = me?.role === "admin" || me?.role === "superadmin";
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const summary = useSummary(month, year).data;
  const budgetGroups = useBudgetGroups().data ?? [];
  const salary = summary?.budget?.salary ?? 0;

  return (
    <div className="max-w-4xl">
      <Tabs value={tab} onValueChange={(value) => setTab(value as SettingsTab)}>
        <TabsList className="flex h-auto flex-wrap">
          {TABS.filter(([key]) => key !== "usuarios" || isAdmin).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="presupuesto" className="mt-4 space-y-6">
      {/* Sueldo y Presupuesto */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4" />
            Sueldo y Presupuesto · {getMonthName(month)} {year}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Gestiona el sueldo mensual, su límite de gasto y los ingresos extra desde Ingresos.</p>
          <Button size="sm" asChild>
            <a href={incomesHref({ month, year })}><ArrowUpRight aria-hidden="true" /> Ir a Ingresos</a>
          </Button>
        </CardContent>
      </Card>

          <BudgetSwitches />
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
              <p className="text-xs text-muted-foreground">Elige Claro, Oscuro o Sistema desde Apariencia en el menú de tu perfil.</p>
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

        </TabsContent>

        <TabsContent value="grupos" className="mt-4 space-y-6">
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

        </TabsContent>

        <TabsContent value="personas" className="mt-4">
          <PeopleTable />
        </TabsContent>

        <TabsContent value="cuentas" className="mt-4">
          <AccountsTable />
        </TabsContent>

        <TabsContent value="notificaciones" className="mt-4">
          <NotificationSettingsCard />
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          <HistoryPanel />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="usuarios" className="mt-4">
            <UsersPanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export const SettingsPage = withQuery(SettingsPageView);
