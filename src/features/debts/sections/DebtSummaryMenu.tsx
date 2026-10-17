import { BellRing, Copy, Download, MoreHorizontal, RefreshCw, Snowflake } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useCollectNow } from '@/features/notifications/hooks/notifications'
import { useSetPersonSummariesStatus } from '../hooks/personSummaries'
import { PERSON_SUMMARY_STATUS_LABELS, EMPTY_PERSON_SUMMARY } from './PersonSummaryControls'
import type { PersonSummaryStatus } from '../types/person-summary.dto'
import { downloadCsv } from '@/shared/lib/export-csv'
import { Button } from '@/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/ui/dropdown-menu'

interface SummaryRow {
  personId: string
  name: string
  total: number
  records: number
}

// "⋯" of the Resumen header: freeze every draft at once, export the month, re-read it, share the view
export function DebtSummaryMenu({
  rows,
  statusOf,
  month,
  year,
}: {
  rows: SummaryRow[]
  statusOf: (personId: string) => PersonSummaryStatus | undefined
  month: number
  year: number
}) {
  const queryClient = useQueryClient()
  const setStatus = useSetPersonSummariesStatus()
  const collect = useCollectNow()
  const withBalance = rows.filter((row) => row.total > 0)
  const drafts = rows.filter((row) => (statusOf(row.personId) ?? EMPTY_PERSON_SUMMARY.status) === 'draft')

  const exportCsv = () =>
    downloadCsv(
      `resumen-${year}-${String(month).padStart(2, '0')}.csv`,
      ['Persona', 'Estado', 'Registros', 'Saldo'],
      rows.map((row) => [row.name, PERSON_SUMMARY_STATUS_LABELS[statusOf(row.personId) ?? 'draft'], row.records, row.total.toFixed(2)]),
    )
  const recalculate = () => {
    void queryClient.invalidateQueries()
    toast.success('Borradores recalculados')
  }
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Enlace copiado')
    } catch {
      toast.error('No se pudo copiar el enlace')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Más acciones del resumen">
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuItem
          disabled={!drafts.length || setStatus.isPending}
          onSelect={() =>
            setStatus.mutate({
              month,
              year,
              personIds: drafts.map((row) => row.personId),
              status: 'in_progress',
            })
          }
        >
          <Snowflake />
          <span className="flex flex-col">
            Pasar todo a En progreso
            <span className="text-xs text-muted-foreground">
              {drafts.length
                ? `Congela montos de ${drafts.length} ${drafts.length === 1 ? 'persona' : 'personas'} en borrador`
                : 'No hay personas en borrador'}
            </span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!withBalance.length || collect.isPending}
          onSelect={() =>
            collect.mutate({
              month,
              year,
              personIds: withBalance.map((row) => row.personId),
            })
          }
        >
          <BellRing />
          <span className="flex flex-col">
            Cobrar a todos por Mensajes
            <span className="text-xs text-muted-foreground">
              {withBalance.length ? `Un aviso por persona con saldo (${withBalance.length}), listo para reenviar` : 'Nadie tiene saldo este mes'}
            </span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!rows.length} onSelect={exportCsv}>
          <Download /> Exportar resumen (CSV)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={recalculate}>
          <RefreshCw />
          <span className="flex flex-col">
            Recalcular borradores
            <span className="text-xs text-muted-foreground">Vuelve a leer los movimientos del mes</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void copyLink()}>
          <Copy /> Copiar enlace a la vista
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
