import { ArrowRight, CalendarDays } from 'lucide-react'
import { formatCurrency } from '@/shared/lib/currency'
import { getMonthName } from '@/shared/lib/dates'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'
import { Progress } from '@/ui/progress'
import { useNextMonthForecast } from '../hooks/useNextMonthForecast'

export function DashboardNextMonthCard({ month, year }: { month: number; year: number }) {
  const forecast = useNextMonthForecast(month, year)
  const percent = forecast.commitmentPercent

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm">Siguiente mes · {getMonthName(forecast.month)}</CardTitle>
        <a href="/calendario" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          Calendario <ArrowRight className="size-3" />
        </a>
      </CardHeader>
      <CardContent className="space-y-3">
        {forecast.isLoading ? (
          <div className="space-y-3" aria-label="Cargando previsión">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : forecast.isError ? (
          <div className="flex min-h-36 flex-col items-start justify-center gap-2 text-sm">
            <p className="text-muted-foreground">No se pudo cargar la previsión de {getMonthName(forecast.month).toLowerCase()}.</p>
            <Button variant="outline" size="sm" onClick={forecast.retry}>
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Progress
                value={Math.min(percent ?? 0, 100)}
                aria-label="Porcentaje del sueldo comprometido"
                className="bg-muted [&_[data-slot=progress-indicator]]:bg-primary"
              />
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{percent == null ? 'Registra tu sueldo para ver el compromiso' : `${percent}% del sueldo comprometido`}</span>
                <span className="shrink-0 font-medium tabular-nums text-foreground">{formatCurrency(forecast.committed)}</span>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Tarjetas (cuotas)</dt>
                <dd className="tabular-nums">{formatCurrency(forecast.cards)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Costos fijos</dt>
                <dd className="tabular-nums">{formatCurrency(forecast.fixed)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Préstamos</dt>
                <dd className="tabular-nums">{formatCurrency(forecast.loans)}</dd>
              </div>
            </dl>
            <div className="flex items-center justify-between border-t pt-2 text-sm">
              <span className="font-medium">Libre del sueldo (est.)</span>
              <span className={`font-semibold tabular-nums ${forecast.available < 0 ? 'text-destructive' : 'text-emerald-400'}`}>
                {formatCurrency(forecast.available)}
              </span>
            </div>
            <p className="flex min-h-4 items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {forecast.firstDue
                ? `Primero vence: ${forecast.firstDue.title} · ${forecast.firstDue.date.slice(8, 10)} ${getMonthName(forecast.month).slice(0, 3).toLowerCase()}`
                : 'Sin vencimientos registrados'}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
