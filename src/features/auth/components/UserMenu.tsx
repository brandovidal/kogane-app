import { LogOut, User, UserCheck } from "lucide-react";

import { useLogout, useMe, useStopImpersonation } from "@/shared/api/hooks/auth";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { withQuery } from "@/shared/api/query";

const ROLE_LABELS: Record<string, string> = { superadmin: "Superadmin", admin: "Admin", member: "Miembro" };

// The person in the header: profile, sign out, and — for a superadmin who entered as someone (the backdoor) — the way
// back. Its request also sends whoever has no session to Entrar (P23)
function UserMenuView() {
  const { data: me } = useMe();
  const logout = useLogout();
  const stop = useStopImpersonation();
  if (!me) return null;

  const initials = me.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex items-center gap-2">
      {me.impersonatedBy && (
        <Badge variant="destructive" className="hidden gap-1 sm:inline-flex" title={`Entraste como superadmin (${me.impersonatedBy.name})`}>
          <UserCheck className="h-3 w-3" /> Viendo como {me.name}
        </Badge>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted text-xs font-semibold" aria-label={`Cuenta de ${me.name}`}>
            {initials || <User className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="space-y-0.5">
            <p className="truncate text-sm font-medium">{me.name}</p>
            <p className="truncate text-xs font-normal text-muted-foreground">{me.email}</p>
            <p className="text-xs font-normal text-muted-foreground">{ROLE_LABELS[me.role] ?? me.role}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/perfil">
              <User /> Perfil
            </a>
          </DropdownMenuItem>
          {me.impersonatedBy && (
            <DropdownMenuItem onSelect={() => stop.mutate(undefined, { onSuccess: () => window.location.replace("/configuracion?tab=usuarios") })}>
              <UserCheck /> Volver a mi cuenta
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => logout.mutate(undefined, { onSuccess: () => window.location.replace("/entrar") })}>
            <LogOut /> Salir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const UserMenu = withQuery(UserMenuView);
