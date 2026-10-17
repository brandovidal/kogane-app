import { useState } from 'react'
import { Laptop, LogOut, Monitor, Smartphone, Tablet } from 'lucide-react'

import { useDeviceSessions, useLogout, useRevokeDeviceSession, useRevokeOtherDeviceSessions } from '@/features/auth/hooks/auth'
import type { AuthDeviceSession } from '@/features/auth/types/auth.dto'
import { Button } from '@/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'
import { ProfileAccentCard } from './ProfileAccentCard'

function DeviceIcon({ kind }: { kind: AuthDeviceSession['kind'] }) {
  const Icon = kind === 'mobile' ? Smartphone : kind === 'tablet' ? Tablet : kind === 'desktop' ? Monitor : Laptop
  return <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
}

function formatRelativeLastSeen(value: string) {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (elapsedSeconds < 60) return 'activa ahora'
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'always' })
  for (const [unit, seconds] of units) {
    if (elapsedSeconds >= seconds) return formatter.format(-Math.floor(elapsedSeconds / seconds), unit)
  }
  return 'activa ahora'
}

function sessionName(session: AuthDeviceSession) {
  return session.kind === 'mobile' || session.kind === 'tablet' ? `${session.os} · ${session.browser}` : `${session.browser} · ${session.os}`
}

export function ProfileSessionsCard() {
  const sessions = useDeviceSessions()
  const revokeOne = useRevokeDeviceSession()
  const revokeOthers = useRevokeOtherDeviceSessions()
  const logout = useLogout()
  const [showAll, setShowAll] = useState(false)
  const devices = sessions.data ?? []
  const otherSessions = devices.filter((session) => !session.current)
  const visibleSessions = showAll ? devices : devices.slice(0, 2)

  const closeSession = (session: AuthDeviceSession) => {
    if (session.current) return
    if (!window.confirm(`¿Cerrar la sesión de ${session.browser} en ${session.os}?`)) return
    revokeOne.mutate(session.id)
  }

  const closeOtherSessions = () => {
    if (!otherSessions.length || revokeOthers.isPending) return
    if (!window.confirm(`¿Cerrar las ${otherSessions.length} sesiones de otros dispositivos?`)) return
    revokeOthers.mutate(undefined)
  }

  return (
    <ProfileAccentCard tone="session" id="sesiones">
      <CardHeader className="gap-1.5 px-5 pt-5 pb-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300">
            <LogOut aria-hidden="true" className="size-4" />
          </span>
          <CardTitle className="text-base">Sesión</CardTitle>
        </div>
        <CardDescription className="leading-5">Estás dentro en este navegador. Cierra la sesión si usas un equipo ajeno.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-5 pt-0 pb-5">
        {sessions.isLoading && (
          <div className="space-y-3" aria-label="Cargando sesiones">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {sessions.isError && (
          <div className="space-y-2 rounded-lg border p-3">
            <p role="alert" className="text-sm text-muted-foreground">
              No se pudieron cargar tus sesiones.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => void sessions.refetch()}>
              Reintentar
            </Button>
          </div>
        )}

        {sessions.isSuccess && devices.length === 0 && (
          <p className="rounded-lg border p-3 text-sm text-muted-foreground">No encontramos sesiones abiertas.</p>
        )}

        {sessions.isSuccess && devices.length > 0 && (
          <ul className="space-y-2">
            {visibleSessions.map((session) => (
              <li key={session.id} className="flex items-center gap-2.5 rounded-xl border bg-background/40 p-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <DeviceIcon kind={session.kind} />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-xs font-semibold">{session.current ? 'Este navegador' : sessionName(session)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session.browser} · {session.os} · {session.current ? 'activa ahora' : formatRelativeLastSeen(session.lastSeenAt)}
                  </p>
                </div>
                {session.current ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-400" /> Activa
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto shrink-0 px-1 py-1 text-xs text-foreground underline underline-offset-2"
                    disabled={revokeOne.isPending || revokeOthers.isPending}
                    onClick={() => closeSession(session)}
                  >
                    Cerrar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        {sessions.isSuccess && devices.length > 2 && (
          <Button type="button" variant="outline" className="w-full justify-between" onClick={() => setShowAll((value) => !value)}>
            {showAll ? 'Mostrar menos' : 'Gestionar dispositivos'}
            <span aria-hidden="true" className={showAll ? 'rotate-[-90deg]' : 'rotate-90'}>
              ›
            </span>
          </Button>
        )}

        <div className="space-y-2 border-t pt-3">
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            disabled={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSuccess: () => window.location.replace('/entrar'),
              })
            }
          >
            <LogOut aria-hidden="true" className="size-4" />
            {logout.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full border-rose-500/40 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
            disabled={!otherSessions.length || revokeOthers.isPending || sessions.isLoading}
            onClick={closeOtherSessions}
          >
            {revokeOthers.isPending ? 'Cerrando sesiones…' : 'Cerrar en los demás dispositivos'}
          </Button>
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/[0.06] px-3 py-2 text-xs leading-4 text-rose-200/90">
            <span className="mr-1.5 text-rose-300" aria-hidden="true">
              ⓘ
            </span>
            Tu información queda guardada; solo se desconecta este acceso.
          </p>
        </div>
      </CardContent>
    </ProfileAccentCard>
  )
}
