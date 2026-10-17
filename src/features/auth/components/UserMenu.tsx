import { History, LogOut, Settings2, Shield, User, UserCheck } from 'lucide-react'

import { useLogout, useMe, useStopImpersonation } from '@/features/auth/hooks/auth'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { withQuery } from '@/shared/api/query'
import { ThemeMenuItems } from '@/shared/components/theme/ThemeMenuItems'
import { AUTH_ROLE, AUTH_ROLE_LABELS } from '../constants/roles'

// The person in the header: profile, sign out, and — for a superadmin who entered as someone (the backdoor) — the way
// back. Its request also sends whoever has no session to Entrar (P23)
function UserMenuView() {
  const { data: me } = useMe()
  const logout = useLogout()
  const stop = useStopImpersonation()
  if (!me) return null

  const initials = me.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

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
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border-border/80 bg-card p-0 shadow-lg"
        >
          <DropdownMenuLabel className="flex items-center gap-3 px-4 py-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold">
              {initials || <User className="size-4" />}
            </span>
            <span className="min-w-0 space-y-0.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate text-base font-semibold tracking-tight text-foreground">{me.name}</span>
                <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[11px] font-medium text-brand">
                  {AUTH_ROLE_LABELS[me.role] ?? me.role}
                </span>
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">{me.email}</span>
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="m-0" />
          <div className="space-y-0.5 px-2 py-2">
            <DropdownMenuItem asChild className="min-h-10 gap-3 rounded-lg px-3 text-sm [&_svg]:size-4">
              <a href="/configuracion/perfil">
                <User /> Perfil
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="min-h-10 gap-3 rounded-lg px-3 text-sm [&_svg]:size-4">
              <a href="/configuracion/general">
                <Settings2 /> Configuración
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="min-h-10 gap-3 rounded-lg px-3 text-sm [&_svg]:size-4">
              <a href="/configuracion/historial">
                <History /> Historial de cambios
              </a>
            </DropdownMenuItem>
          </div>
          {(me.role === AUTH_ROLE.ADMIN || me.role === AUTH_ROLE.SUPERADMIN) && (
            <>
              <DropdownMenuSeparator className="m-0" />
              <DropdownMenuLabel className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Administración
              </DropdownMenuLabel>
              <div className="px-2 pb-2">
                <DropdownMenuItem asChild className="min-h-10 gap-3 rounded-lg px-3 text-sm [&_svg]:size-4">
                  <a href="/configuracion/usuarios">
                    <Shield /> Usuarios
                    <span className="ml-auto text-xs font-normal text-muted-foreground">Admin</span>
                  </a>
                </DropdownMenuItem>
              </div>
            </>
          )}
          <DropdownMenuSeparator className="m-0" />
          <div className="px-4 pt-3 pb-2">
            <ThemeMenuItems />
          </div>
          <DropdownMenuSeparator className="m-0" />
          {me.impersonatedBy && (
            <DropdownMenuItem
              className="mx-2 my-1 min-h-10 rounded-lg px-3 text-sm"
              disabled={stop.isPending}
              onSelect={() =>
                stop.mutate(undefined, {
                  onSuccess: () => window.location.replace('/configuracion/usuarios'),
                })
              }
            >
              <UserCheck /> Volver a mi cuenta
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            className="mx-2 my-1 min-h-10 rounded-lg px-3 text-sm [&_svg]:size-4"
            disabled={logout.isPending}
            onSelect={() =>
              logout.mutate(undefined, {
                onSuccess: () => window.location.replace('/entrar'),
              })
            }
          >
            <LogOut /> Salir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const UserMenu = withQuery(UserMenuView)
