import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Switch } from "@/ui/switch";
import {
  useBudgetSettings,
  useSaveBudgetSettings,
} from "@/features/budget/hooks/summary";

// D96: what else adds to the Relación de gastos. Fixed costs and cards always do; a subscription paid with a credit
// card never does (the card charge already counts, D46)
export function BudgetSwitches() {
  const { data } = useBudgetSettings();
  const save = useSaveBudgetSettings();
  const row = (
    key: "recurringCount" | "platformsCount",
    title: string,
    help: string,
  ) => (
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
        {row(
          "recurringCount",
          "Recurrentes suman",
          "Servicios (Bitel, Enel, internet), anuales y otros cuentan en el grupo de su categoría.",
        )}
        {row(
          "platformsCount",
          "Plataformas suman",
          "Netflix, HBO, Spotify… Apagado, como en tu Resumen de Notion: ya cuentan en el cargo de la tarjeta.",
        )}
        <p className="text-xs text-muted-foreground">
          Costos fijos, tarjetas y día a día siempre suman. Lo pagado con
          tarjeta de crédito nunca se cuenta dos veces.
        </p>
      </CardContent>
    </Card>
  );
}
