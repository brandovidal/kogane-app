import { CalendarDays, CreditCard, FileUp, MessageCircle, Plus, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDraftCount } from '@/features/drafts/hooks/drafts'
import { useNewExpense } from '@/features/new-expense/stores/new-expense.store'
import { cn } from '@/shared/utils/cn'
import type { DashboardPaymentTab } from '../types/dashboard'
import { Badge } from '@/ui/badge'

const actionClass =
  'inline-flex min-h-10 items-center gap-2 rounded-lg border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function DashboardQuickActions({ onRegisterPayment }: { onRegisterPayment: (tab: DashboardPaymentTab) => void }) {
  const draftCount = useDraftCount().data ?? 0
  const [hasHydrated, setHasHydrated] = useState(false)
  const openNewExpense = useNewExpense((state) => state.openWith)

  useEffect(() => {
    setHasHydrated(true)
  }, [])

  return (
    <nav aria-label="Accesos rápidos" className="flex flex-wrap items-center gap-2 rounded-xl border bg-card/60 p-2.5">
      <span className="px-2 text-xs font-medium text-muted-foreground">Accesos rápidos</span>
      <button
        type="button"
        onClick={() => openNewExpense()}
        className={cn(actionClass, 'border-primary bg-primary text-primary-foreground hover:bg-primary/90')}
      >
        <Plus className="size-4" />
        Nuevo gasto
      </button>
      <button type="button" onClick={() => onRegisterPayment('card')} className={actionClass}>
        <CreditCard className="size-4 text-primary" />
        Registrar pago
      </button>
      <a href="/mensajes" className={actionClass}>
        <MessageCircle className="size-4 text-primary" />
        Mensajes
      </a>
      <a href="/importacion" className={actionClass}>
        <FileUp className="size-4 text-primary" />
        Importar
      </a>
      <a href="/borrador" className={cn(actionClass, 'relative')}>
        <WalletCards className="size-4 text-primary" />
        Borrador
        {hasHydrated && draftCount > 0 && (
          <Badge variant="secondary" className="absolute -top-3 -right-3 px-2 py-1">
            {draftCount}
          </Badge>
        )}
      </a>
      <a href="/calendario" className={actionClass}>
        <CalendarDays className="size-4 text-primary" />
        Calendario
      </a>
    </nav>
  )
}
