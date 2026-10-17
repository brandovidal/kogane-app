import { useSummary } from '@/features/budget/hooks/summary'
import { withQuery } from '@/shared/api/query'
import { useState } from 'react'
import { usePeriod } from '@/shared/stores/period.store'
import { DashboardPaymentDialog } from './DashboardPaymentDialog'
import { DashboardView } from '../views/DashboardView'
import type { DashboardPaymentTab } from '../types/dashboard'

function DashboardPageView() {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentTab, setPaymentTab] = useState<DashboardPaymentTab>('card')
  const month = usePeriod((s) => s.month)
  const year = usePeriod((s) => s.year)
  const summary = useSummary(month, year).data

  return (
    <>
      <DashboardView
        summary={summary}
        month={month}
        year={year}
        onRegisterPayment={(tab) => {
          setPaymentTab(tab)
          setPaymentDialogOpen(true)
        }}
      />
      <DashboardPaymentDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} initialTab={paymentTab} />
    </>
  )
}

export const DashboardPage = withQuery(DashboardPageView)
