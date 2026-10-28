import { Target } from 'lucide-react'
import { formatCurrency } from '@/shared/lib/currency'
import { getMonthName } from '@/shared/lib/dates'
import { Button } from '@/ui/button'

const GROUP_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']
const SUGGESTED_SPLIT = [
  { title: 'Costos fijos', percentage: 36, color: GROUP_COLORS[0] },
  { title: 'Gastos sin culpa', percentage: 50, color: GROUP_COLORS[1] },
  { title: 'Inversión', percentage: 0, color: GROUP_COLORS[2] },
  { title: 'Ahorros', percentage: 14, color: GROUP_COLORS[3] },
]

export interface BudgetSetupSectionProps {
  month: number
  year: number
  salary: number
  proposal: boolean
  onCreate: () => void
  onCopy: () => void
  canCopy: boolean
  copying: boolean
}

export function BudgetSetupSection({ month, year, salary, proposal, onCreate, onCopy, canCopy, copying }: BudgetSetupSectionProps) {
  const previousMonth = month === 1 ? 12 : month - 1
  const previousYear = month === 1 ? year - 1 : year
  return (
    <div className="space-y-4">
      <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
        <strong>
          {getMonthName(month)} {year} aún no tiene presupuesto.
        </strong>{' '}
        <span className="text-muted-foreground">Primero define tu sueldo y el reparto; después podrás gestionar categorías e ingresos extra.</span>
      </div>
      <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6" aria-labelledby="budget-setup-title">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target className="size-5" />
          </span>
          <div>
            <h2 id="budget-setup-title" className="text-lg font-semibold">
              Primero, tu presupuesto de {getMonthName(month).toLowerCase()}
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Es lo primero que necesita Kogane. Con tu sueldo y un reparto por grupos, todo lo demás se compara contra él.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <SetupField label="Mes">
            {getMonthName(month)} {year}
          </SetupField>
          <SetupField label="Sueldo del mes">S/ {salary.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</SetupField>
          <SetupField label="Copiar de">
            {getMonthName(previousMonth)} {previousYear}
          </SetupField>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reparto sugerido</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {SUGGESTED_SPLIT.map((item) => (
              <div key={item.title} className="rounded-xl border bg-background/50 p-4">
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="mt-1 text-2xl font-semibold" style={{ color: item.color }}>
                  {item.percentage} %
                </p>
                <p className="text-xs text-muted-foreground">{formatCurrency((salary * item.percentage) / 100)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onCreate}>{proposal ? 'Confirmar presupuesto' : `Crear presupuesto de ${getMonthName(month).toLowerCase()}`}</Button>
          <Button variant="outline" disabled={!canCopy || copying} onClick={onCopy}>
            Copiar el del mes anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById('budget-categories-locked')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          >
            <Target className="size-4" /> Hacer el recorrido de primeros pasos
          </Button>
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <LockedSetupCard id="budget-categories-locked" title="Categorías y límites">
          Ponle un límite a cada categoría cuando exista el presupuesto del mes.
        </LockedSetupCard>
        <LockedSetupCard title="Ingresos extra">Bonos, ventas o cualquier ingreso fuera del sueldo.</LockedSetupCard>
      </div>
    </div>
  )
}

function SetupField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm tabular-nums">{children}</div>
    </div>
  )
}

function LockedSetupCard({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-xl border bg-card p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 flex min-h-32 flex-col items-center justify-center rounded-xl border text-center">
        <span className="font-medium">Disponible después</span>
        <p className="mt-1 max-w-sm px-4 text-sm text-muted-foreground">{children}</p>
      </div>
    </section>
  )
}
