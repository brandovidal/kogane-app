import { ArrowUpRight, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'

export function BudgetSection() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Presupuesto</CardTitle>
        <CardDescription>
          El sueldo, los límites por categoría, los ingresos extra y qué suma al presupuesto viven ahora en su propia página.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <a href="/presupuesto" className="settings-budget-link">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 text-sm leading-relaxed">
            Costos fijos, tarjetas y día a día siempre suman. Recurrentes y plataformas se activan desde Presupuesto.
            <span className="ml-1 inline-flex items-center gap-1 font-medium text-primary">
              Ir a Presupuesto <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </span>
          </span>
        </a>
      </CardContent>
    </Card>
  )
}
