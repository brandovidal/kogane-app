import { useState } from "react";
import { Banknote, LogOut, User, UserCheck } from "lucide-react";

import {
  useLogout,
  useMe,
  useStopImpersonation,
} from "@/features/auth/hooks/auth";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { withQuery } from "@/shared/api/query";
import { incomesHref } from "@/features/incomes/lib/income-links";
import { periodFromParams } from "@/shared/lib/period";
import { periodStore } from "@/shared/stores/period.store";
import { SettingsMenuItems } from "@/features/settings/components/SettingsMenuItems";
import { ThemeMenuItems } from "@/shared/components/theme/ThemeMenuItems";
import { AUTH_ROLE, AUTH_ROLE_LABELS } from "../constants/roles";

// The person in the header: profile, sign out, and — for a superadmin who entered as someone (the backdoor) — the way
// back. Its request also sends whoever has no session to Entrar (P23)
function UserMenuView() {
  const { data: me } = useMe();
  const logout = useLogout();
  const stop = useStopImpersonation();
  const [incomeLink, setIncomeLink] = useState("/ingresos");
  if (!me) return null;

  const initials = me.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-center gap-2">
      {me.impersonatedBy && (
        <Badge
          variant="destructive"
          className="hidden gap-1 sm:inline-flex"
          title={`Entraste como superadmin (${me.impersonatedBy.name})`}
        >
          <UserCheck className="h-3 w-3" /> Viendo como {me.name}
        </Badge>
      )}
      <DropdownMenu
        onOpenChange={(open) => {
          if (open)
            setIncomeLink(
              incomesHref(
                periodFromParams(
                  new URLSearchParams(window.location.search),
                  periodStore.getState(),
                ),
              ),
            );
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-muted text-xs font-semibold"
            aria-label={`Cuenta de ${me.name}`}
          >
            {initials || <User className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 max-w-[calc(100vw-2rem)]"
        >
          <DropdownMenuLabel className="space-y-0.5">
            <p className="truncate text-sm font-medium">{me.name}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">
              {me.email}
            </p>
            <p className="text-xs font-normal text-muted-foreground">
              {AUTH_ROLE_LABELS[me.role] ?? me.role}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="min-h-9">
            <a href="/perfil">
              <User /> Perfil
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="min-h-9">
            <a href={incomeLink}>
              <Banknote aria-hidden="true" /> Sueldo e ingresos
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <SettingsMenuItems
            isAdmin={
              me.role === AUTH_ROLE.ADMIN || me.role === AUTH_ROLE.SUPERADMIN
            }
          />
          <DropdownMenuSeparator />
          <ThemeMenuItems />
          <DropdownMenuSeparator />
          {me.impersonatedBy && (
            <DropdownMenuItem
              className="min-h-9"
              disabled={stop.isPending}
              onSelect={() =>
                stop.mutate(undefined, {
                  onSuccess: () =>
                    window.location.replace("/configuracion?tab=usuarios"),
                })
              }
            >
              <UserCheck /> Volver a mi cuenta
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="min-h-9"
            disabled={logout.isPending}
            onSelect={() =>
              logout.mutate(undefined, {
                onSuccess: () => window.location.replace("/entrar"),
              })
            }
          >
            <LogOut /> Salir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const UserMenu = withQuery(UserMenuView);
