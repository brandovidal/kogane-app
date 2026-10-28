import { useEffect, useState } from 'react'
import { withQuery } from '@/shared/api/query'
import { AccountsTable } from '../components/accounts/AccountsTable'
import { CardsAccountsTabs } from '../components/accounts/CardsAccountsTabs'
import { OutputAccountsPanel } from '../components/accounts/OutputAccountsPanel'
import { NotificationSettingsCard } from '../components/notifications/NotificationSettingsCard'
import { DevicesPage } from '../components/devices'
import { PeoplePage } from '../components/people/PeoplePage'
import { SettingsShell } from '../components/navigation/SettingsShell'
import { ProfilePage } from './ProfilePage'
import type { CardsAccountsTab, SettingsSection } from '../types/navigation'
import { useMe } from '@/features/auth/hooks/auth'
import { GeneralSettingsView } from '../views/GeneralSettingsView'
import { UsersPanel } from '@/features/auth/components/UsersPanel'
import { HistoryPanel } from '@/features/history/components/HistoryPanel'
import { CARDS_ACCOUNTS_TAB, SETTINGS_SECTION } from '../constants/sections'

interface SettingsPageViewProps {
  section: SettingsSection
  tab?: CardsAccountsTab
}

function SettingsPageView({ section, tab = CARDS_ACCOUNTS_TAB.CREDITO }: SettingsPageViewProps) {
  const { data: me } = useMe()
  const [hasHydrated, setHasHydrated] = useState(false)
  useEffect(() => setHasHydrated(true), [])
  const isAdmin = hasHydrated && (me?.role === 'admin' || me?.role === 'superadmin')

  return (
    <SettingsShell
      section={section}
      isAdmin={isAdmin}
      wide={
        section === SETTINGS_SECTION.PERFIL ||
        section === SETTINGS_SECTION.NOTIFICACIONES ||
        section === SETTINGS_SECTION.DISPOSITIVOS ||
        section === SETTINGS_SECTION.HISTORIAL
      }
    >
      {section === SETTINGS_SECTION.PERFIL && <ProfilePage />}
      {section === SETTINGS_SECTION.GENERAL && <GeneralSettingsView />}
      {section === SETTINGS_SECTION.NOTIFICACIONES && <NotificationSettingsCard />}
      {section === SETTINGS_SECTION.DISPOSITIVOS && <DevicesPage />}
      {section === SETTINGS_SECTION.CUENTAS_TARJETAS && (
        <div className="space-y-4">
          <CardsAccountsTabs active={tab} />
          {tab === CARDS_ACCOUNTS_TAB.CREDITO && <AccountsTable scope="credit" />}
          {tab === CARDS_ACCOUNTS_TAB.DEBITO && <AccountsTable scope="other" />}
          {tab === CARDS_ACCOUNTS_TAB.CUENTAS_SALIDA && <OutputAccountsPanel />}
        </div>
      )}
      {section === SETTINGS_SECTION.PERSONAS && <PeoplePage />}
      {section === SETTINGS_SECTION.HISTORIAL && <HistoryPanel />}
      {section === SETTINGS_SECTION.USUARIOS && isAdmin && <UsersPanel />}
    </SettingsShell>
  )
}

export const SettingsPage = withQuery(SettingsPageView)
