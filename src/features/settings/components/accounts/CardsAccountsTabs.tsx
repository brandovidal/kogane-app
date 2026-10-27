import { useEffect, useState } from 'react'
import { usePaymentMethods, useAccounts } from '@/shared/api/hooks/catalogs'
import { UnderlineTabList } from '@/shared/components/navigation/UnderlineTabList'
import { CARDS_ACCOUNTS_TABS, type CardsAccountsTab } from '../../constants/sections'

export function CardsAccountsTabs({ active }: { active: CardsAccountsTab }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const methods = usePaymentMethods().data ?? []
  const accounts = useAccounts().data ?? []
  useEffect(() => setIsHydrated(true), [])
  const counts: Record<CardsAccountsTab, number> = {
    credito: methods.filter((method) => method.type === 'credit_card').length,
    debito: methods.filter((method) => method.type !== 'credit_card').length,
    'cuentas-salida': accounts.length,
  }
  return (
    <UnderlineTabList
      ariaLabel="Cuentas y tarjetas"
      activeKey={active}
      items={CARDS_ACCOUNTS_TABS.map(({ key, label, href }) => ({
        key,
        label,
        href,
        count: isHydrated ? counts[key] : <span aria-label="Cargando cantidad">–</span>,
      }))}
    />
  )
}
