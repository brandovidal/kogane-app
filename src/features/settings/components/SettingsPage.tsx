import { useEffect, useState } from "react";
import { withQuery } from "@/shared/api/query";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { ArrowUpRight, PieChart, Palette } from "lucide-react";
import { AccountsTable } from "./AccountsTable";
import { CardsAccountsTabs } from "./CardsAccountsTabs";
import { OutputAccountsPanel } from "./OutputAccountsPanel";
import { PeoplePage } from "./PeoplePage";
import { SettingsShell } from "./SettingsShell";
import { ProfilePage } from "@/features/auth/components/ProfilePage";
import type { CardsAccountsTab, SettingsSection } from "../constants/sections";
import { NotificationSettingsCard } from "./NotificationSettingsCard";
import { UsersPanel } from "@/features/auth/components/UsersPanel";
import { HistoryPanel } from "@/features/history/components/HistoryPanel";
import { useMe } from "@/features/auth/hooks/auth";

function GeneralSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Preferencias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium">Tema</p>
            <p className="text-xs text-muted-foreground">
              Elige Claro, Oscuro o Sistema desde Apariencia en el menú de tu
              perfil.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Moneda predeterminada</p>
            <p className="text-xs text-muted-foreground">
              PEN (Soles peruanos)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChart className="h-4 w-4" />
            Presupuesto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            El sueldo, los grupos, los límites por categoría, los ingresos extra
            y qué suma al presupuesto se gestionan en su propia página.
          </p>
          <Button size="sm" asChild>
            <a href="/presupuesto">
              <ArrowUpRight aria-hidden="true" /> Ir a Presupuesto
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Income editing lives in Ingresos; the budget configuration stays in General.
function SettingsPageView({
  section,
  tab = "credito",
}: {
  section: SettingsSection;
  tab?: CardsAccountsTab;
}) {
  const { data: me } = useMe();
  // The signed-in user may already be cached in the browser while server rendering has no query data
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => setHasHydrated(true), []);
  const isAdmin =
    hasHydrated && (me?.role === "admin" || me?.role === "superadmin");

  return (
    <SettingsShell
      section={section}
      isAdmin={isAdmin}
      wide={section === "perfil"}
    >
      {section === "perfil" && <ProfilePage />}
      {section === "general" && <GeneralSection />}
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
