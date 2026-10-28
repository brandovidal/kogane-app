import { useEffect, useState } from 'react'

import { IncomesPage } from '@/features/incomes/components/IncomesPage'
import { withQuery } from '@/shared/api/query'
import { Tabs, TabsList, TabsTrigger } from '@/ui/tabs'
import { BudgetOverview } from './BudgetOverview'

const TABS = [
  ['resumen', 'Resumen'],
  ['ingresos', 'Ingresos'],
] as const
type BudgetTab = (typeof TABS)[number][0]

// Presupuesto (unifies Relación de gastos, Categorías and Ingresos): the open tab lives in the URL (?tab=ingresos)
function BudgetPageView() {
  const [tab, setTab] = useState<BudgetTab>('resumen')
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('tab')
    if (TABS.some(([key]) => key === fromUrl)) setTab(fromUrl as BudgetTab)
  }, [])
  const change = (next: BudgetTab) => {
    setTab(next)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', next)
    window.history.replaceState(null, '', url)
  }

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={(value) => change(value as BudgetTab)}>
        <TabsList variant="line" className="w-full justify-start gap-6 rounded-none border-b bg-transparent p-0">
          {TABS.map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="h-10 flex-none rounded-none px-3 after:bottom-[-1px] after:h-0.5">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {tab === 'resumen' ? <BudgetOverview /> : <IncomesPage />}
    </div>
  )
}

export const BudgetPage = withQuery(BudgetPageView)
