import { useEffect, useState } from "react";
import { withQuery } from "@/shared/api/query";
import { AccountsTable } from "../components/accounts/AccountsTable";
import { CardsAccountsTabs } from "../components/accounts/CardsAccountsTabs";
import { OutputAccountsPanel } from "../components/accounts/OutputAccountsPanel";
import { NotificationSettingsCard } from "../components/notifications/NotificationSettingsCard";
import { PeoplePage } from "../components/people/PeoplePage";
import { SettingsShell } from "../components/navigation/SettingsShell";
import { ProfilePage } from "@/features/auth/components/ProfilePage";
import type { CardsAccountsTab, SettingsSection } from "../types/navigation";
import { GeneralSettingsView } from "../views/GeneralSettingsView";
import { UsersPanel } from "@/features/auth/components/UsersPanel";
import { HistoryPanel } from "@/features/history/components/HistoryPanel";
import { useMe } from "@/features/auth/hooks/auth";

function SettingsPageView({ section, tab = "credito" }: { section: SettingsSection; tab?: CardsAccountsTab }) {
  const { data: me } = useMe();
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);
  const isAdmin = hasHydrated && (me?.role === "admin" || me?.role === "superadmin");

  return (
    <SettingsShell section={section} isAdmin={isAdmin} wide={section === "perfil"}>
      {section === "perfil" && <ProfilePage />}
      {section === "general" && <GeneralSettingsView />}
      {section === "notificaciones" && <NotificationSettingsCard />}
      {section === "cuentas-tarjetas" && (
        <div className="space-y-4">
          <CardsAccountsTabs active={tab} />
          {tab === "credito" && <AccountsTable scope="credit" />}
          {tab === "debito" && <AccountsTable scope="other" />}
          {tab === "cuentas-salida" && <OutputAccountsPanel />}
        </div>
      )}
      {section === "personas" && <PeoplePage />}
      {section === "historial" && <HistoryPanel />}
      {section === "usuarios" && isAdmin && <UsersPanel />}
    </SettingsShell>
  );
}

export const SettingsPage = withQuery(SettingsPageView);
