import { Switch } from '@/ui/switch'
import { useBudgetSettings, useSaveBudgetSettings } from '@/features/budget/hooks/summary'

// D96: what else adds to the Relación de gastos. Fixed costs and cards always do; a subscription paid with a credit
// card never does (the card charge already counts, D46)
export function BudgetSwitches() {
  const { data } = useBudgetSettings()
  const save = useSaveBudgetSettings()
  const row = (key: 'recurringCount' | 'platformsCount', title: string, help: string) => (
    <div className="flex min-h-20 items-center justify-between gap-4 rounded-lg border bg-background/40 px-3.5 py-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-muted-foreground">{help}</p>
      </div>
      <Switch
        checked={data?.[key] ?? false}
        disabled={!data || save.isPending}
        aria-label={title}
        onCheckedChange={(checked) => save.mutate({ [key]: checked })}
      />
    </div>
  )
  return (
    <section className="space-y-3 rounded-xl border bg-card p-4" aria-labelledby="budget-inclusions-title">
      <div>
        <h2 id="budget-inclusions-title" className="text-sm font-semibold">
          Qué suma al presupuesto
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Costos fijos, tarjetas y día a día siempre suman. Lo pagado con tarjeta de crédito nunca se cuenta dos veces.
        </p>
      </div>
      <div className="grid gap-2.5 lg:grid-cols-2">
        {row('recurringCount', 'Recurrentes suman', 'Servicios (Bitel, Enel, internet), anuales y otros cuentan en el grupo de su categoría.')}
        {row(
          'platformsCount',
          'Plataformas suman',
          'Netflix, HBO, Spotify… Apagado, como en tu Resumen de Notion: ya cuentan en el cargo de la tarjeta.',
        )}
      </div>
    </section>
  )
}
