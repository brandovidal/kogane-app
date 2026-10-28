import { useId } from 'react'
import { Pencil, Plus } from 'lucide-react'
import type { Summary } from '@/shared/api/types'
import { formatCurrency } from '@/shared/lib/currency'
import { Button } from '@/ui/button'

export interface IncomeSummarySectionProps {
  budget: Summary['budget'] | undefined
  totals: { pen: number; usd: number } | undefined
  onEditSalary: () => void
}

export function IncomeSummarySection({ budget, totals, onEditSalary }: IncomeSummarySectionProps) {
  const id = useId()
  const registered = !!budget && !budget.isProposal
  const salary = registered ? budget.salary : 0
  const ready = budget !== undefined && totals !== undefined
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de ingresos del mes">
      <div className="rounded-xl border bg-card p-4" aria-labelledby={`${id}-salary`}>
        <div className="flex items-center justify-between gap-2">
          <h2 id={`${id}-salary`} className="text-sm text-muted-foreground">
            Sueldo mensual
          </h2>
          <Button size="sm" variant="ghost" className="h-6 px-1 text-xs" onClick={onEditSalary} disabled={budget === undefined}>
            {registered ? <Pencil aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {registered ? 'Editar' : 'Registrar'}
          </Button>
        </div>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{budget ? formatCurrency(budget.salary) : '—'}</p>
        <p className="mt-1 text-xs text-muted-foreground">Registrado este mes</p>
      </div>
      <div className="rounded-xl border bg-card p-4" aria-labelledby={`${id}-limit`}>
        <h2 id={`${id}-limit`} className="text-sm text-muted-foreground">
          Límite de gasto
        </h2>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{budget ? formatCurrency(budget.limit) : '—'}</p>
        <p className="mt-1 text-xs text-muted-foreground">{budget ? `${budget.limitPercent} % del sueldo` : 'Se define con el presupuesto'}</p>
      </div>
      <div className="rounded-xl border bg-card p-4" aria-labelledby={`${id}-extra`}>
        <h2 id={`${id}-extra`} className="text-sm text-muted-foreground">
          Ingresos extra
        </h2>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{totals ? formatCurrency(totals.pen) : '—'}</p>
        <p className="mt-1 text-xs text-muted-foreground">{totals ? 'Bonos, ventas y otros ingresos' : 'Cargando ingresos'}</p>
        {!!totals?.usd && <p className="mt-1 text-xs tabular-nums text-muted-foreground">{formatCurrency(totals.usd, 'USD')} adicionales</p>}
      </div>
      <div className="rounded-xl border bg-card p-4" aria-labelledby={`${id}-total`}>
        <h2 id={`${id}-total`} className="text-sm text-muted-foreground">
          Total en soles
        </h2>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{ready ? formatCurrency(salary + totals.pen) : '—'}</p>
        <p className="mt-1 text-xs text-muted-foreground">Sueldo + extras</p>
        {!!totals?.usd && <p className="text-xs text-muted-foreground">Los dólares se muestran por separado, sin conversión.</p>}
      </div>
    </section>
  )
}
