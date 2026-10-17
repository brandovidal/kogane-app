import { useState } from 'react'
import { AlertTriangle, Laptop, LogOut, Monitor, PanelsTopLeft, Shield, Smartphone, Tablet } from 'lucide-react'

import {
  useDeviceSessions,
  useLogout,
  useRevokeDeviceSession,
  useRevokeDeviceSessions,
  useRevokeOtherDeviceSessions,
} from '@/features/auth/hooks/auth'
import type { AuthDeviceKind, AuthDeviceSession } from '@/features/auth/types/auth.dto'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'
import { Skeleton } from '@/ui/skeleton'

type Confirmation = { type: 'single'; session: AuthDeviceSession } | { type: 'selected' } | { type: 'others' } | { type: 'current' }

const DEVICE_ICONS: Record<AuthDeviceKind, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: Laptop,
}

function deviceName(session: AuthDeviceSession) {
  return session.kind === 'mobile' || session.kind === 'tablet' ? `${session.os} · ${session.browser}` : `${session.browser} · ${session.os}`
}

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  const formatter = new Intl.RelativeTimeFormat('es-PE', { numeric: 'always' })
  for (const [unit, duration] of units) {
    if (seconds >= duration) return formatter.format(-Math.floor(seconds / duration), unit)
  }
  return 'ahora'
}

function sessionStarted(value: string) {
  return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    .format(new Date(value))
    .replace(',', ' ·')
}

function timeUntil(value: string) {
  const seconds = Math.max(0, Math.floor((new Date(value).getTime() - Date.now()) / 1000))
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  const formatter = new Intl.RelativeTimeFormat('es-PE', { numeric: 'always' })
  for (const [unit, duration] of units) {
    if (seconds >= duration) return formatter.format(Math.ceil(seconds / duration), unit)
  }
  return 'pronto'
}

function maskedIp(value: string | null) {
  if (!value) return '—'
  const ipv4 = value.split('.')
  if (ipv4.length === 4) return `${ipv4[0]}.${ipv4[1]}.•••.${ipv4[3]}`
  const ipv6 = value.split(':')
  if (ipv6.length > 2) return `${ipv6[0]}:${ipv6[1]}:…:${ipv6.at(-1)}`
  return '•••'
}

function DeviceGlyph({ kind, current = false }: { kind: AuthDeviceKind; current?: boolean }) {
  const Icon = DEVICE_ICONS[kind]
  return (
    <span
      className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${current ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'bg-muted/60 text-muted-foreground'}`}
    >
      <Icon aria-hidden="true" className="size-5" />
    </span>
  )
}

function pluralCount(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function DevicesPage() {
  const sessionsQuery = useDeviceSessions()
  const revokeOne = useRevokeDeviceSession()
  const revokeSelected = useRevokeDeviceSessions()
  const revokeOthers = useRevokeOtherDeviceSessions()
  const logout = useLogout()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const sessions = sessionsQuery.data ?? []
  const currentSession = sessions.find((session) => session.current)
  const otherSessions = sessions.filter((session) => !session.current)
  const selectedSessions = otherSessions.filter((session) => selectedIds.includes(session.id))
  const allSelected = otherSessions.length > 0 && selectedSessions.length === otherSessions.length
  const activeCount = sessions.filter((session) => Date.now() - new Date(session.lastSeenAt).getTime() < 5 * 60_000).length
  const newestOther = [...otherSessions].sort((a, b) => Date.parse(b.lastSeenAt) - Date.parse(a.lastSeenAt))[0]
  const sessionDurationDays = sessions[0]
    ? Math.max(1, Math.round((Date.parse(sessions[0].expiresAt) - Date.parse(sessions[0].createdAt)) / 86_400_000))
    : 30
  const pending = revokeOne.isPending || revokeSelected.isPending || revokeOthers.isPending || logout.isPending

  const toggleSession = (id: string, checked: boolean) => {
    setSelectedIds((current) => (checked ? [...new Set([...current, id])] : current.filter((value) => value !== id)))
  }

  const confirm = async () => {
    if (!confirmation || pending) return
    try {
      if (confirmation.type === 'single') await revokeOne.mutateAsync(confirmation.session.id)
      if (confirmation.type === 'selected') {
        await revokeSelected.mutateAsync(selectedSessions.map((session) => session.id))
        setSelectedIds([])
      }
      if (confirmation.type === 'others') {
        await revokeOthers.mutateAsync(undefined)
        setSelectedIds([])
      }
      if (confirmation.type === 'current') {
        await logout.mutateAsync(undefined)
        window.location.replace('/entrar')
        return
      }
      setConfirmation(null)
    } catch {
      // The mutation hooks surface the API error in a toast; keep the confirmation open.
    }
  }

  const otherTypeCounts = otherSessions.reduce<Record<AuthDeviceKind, number>>(
    (counts, session) => ({ ...counts, [session.kind]: counts[session.kind] + 1 }),
    { desktop: 0, mobile: 0, tablet: 0, unknown: 0 },
  )
  const confirmSessions = confirmation?.type === 'single' ? [confirmation.session] : confirmation?.type === 'selected' ? selectedSessions : []
  const confirmCount = confirmation?.type === 'selected' ? selectedSessions.length : otherSessions.length

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Dispositivos</h1>
          <p className="text-sm text-muted-foreground">Donde tienes la sesión abierta. Cierra las que no reconozcas.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={otherSessions.length === 0 || pending || sessionsQuery.isLoading}
          onClick={() => setConfirmation({ type: 'others' })}
        >
          <LogOut aria-hidden="true" className="size-4" />
          Cerrar en los demás dispositivos
        </Button>
      </header>

      {sessionsQuery.isLoading && (
        <div className="space-y-4" aria-label="Cargando dispositivos">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      )}
      {sessionsQuery.isError && (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-5">
            <p role="alert" className="text-sm text-muted-foreground">
              No se pudieron cargar tus sesiones.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => void sessionsQuery.refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {sessionsQuery.isSuccess && (
        <>
          <Card className="overflow-hidden rounded-2xl border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.08] via-card to-card shadow-none">
            <div className="h-1 bg-emerald-400" />
            <CardContent className="flex flex-wrap items-center gap-3 p-4 sm:gap-4 sm:p-5">
              {currentSession ? (
                <>
                  <DeviceGlyph kind={currentSession.kind} current />
                  <div className="min-w-48 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{deviceName(currentSession)}</h2>
                      <Badge className="gap-1.5 bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/15">
                        <span className="size-1.5 rounded-full bg-emerald-400" /> Este dispositivo
                      </Badge>
                      {currentSession.impersonated && (
                        <Badge variant="outline" className="text-amber-300">
                          Soporte
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Sesión actual · inició {sessionStarted(currentSession.createdAt)}</p>
                  </div>
                  <span className="text-sm font-medium">{maskedIp(currentSession.ipAddress)}</span>
                  <span className="min-w-16 text-right text-sm text-muted-foreground">ahora</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={pending}
                    onClick={() => setConfirmation({ type: 'current' })}
                  >
                    <LogOut aria-hidden="true" className="size-4" /> Cerrar sesión
                  </Button>
                </>
              ) : (
                <div className="py-1 text-sm text-muted-foreground">No encontramos una sesión para este navegador.</div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border-indigo-400/20 bg-gradient-to-br from-indigo-400/[0.07] via-card to-card py-0 shadow-none">
            <div className="h-1 bg-indigo-300" />
            <CardHeader className="gap-2 px-5 pt-5 pb-0 sm:px-6">
              <CardTitle className="flex items-center gap-2.5 text-lg">
                <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-400/15 text-indigo-300">
                  <PanelsTopLeft className="size-4" />
                </span>
                Otras sesiones
                <Badge variant="secondary">{otherSessions.length}</Badge>
              </CardTitle>
              <CardDescription>
                Cada una es un navegador o app donde entraste. Cerrarla no borra tus datos: solo pide iniciar sesión otra vez.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pt-4 pb-2 sm:px-6">
              {otherSessions.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No hay otras sesiones abiertas.</div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
                      <Checkbox
                        checked={allSelected ? true : selectedSessions.length > 0 ? 'indeterminate' : false}
                        onCheckedChange={(checked) => setSelectedIds(checked ? otherSessions.map((session) => session.id) : [])}
                        aria-label="Seleccionar todas las sesiones"
                      />
                      Seleccionar todas
                    </label>
                    <span className="text-xs font-medium text-amber-400">Ubicación aproximada · Próximamente</span>
                  </div>
                  {selectedSessions.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b py-3">
                      <span className="text-sm text-muted-foreground">
                        {pluralCount(selectedSessions.length, 'sesión', 'sesiones')}{' '}
                        {selectedSessions.length === 1 ? 'seleccionada' : 'seleccionadas'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={pending}
                          onClick={() => setConfirmation({ type: 'selected' })}
                        >
                          <LogOut className="size-4" /> Cerrar {pluralCount(selectedSessions.length, 'sesión', 'sesiones')}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="hidden grid-cols-[minmax(18rem,1fr)_9rem_8rem_5rem] gap-4 border-b px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground lg:grid">
                    <span>Dispositivo</span>
                    <span>Dirección IP</span>
                    <span>Último uso</span>
                    <span />
                  </div>
                  <ul>
                    {otherSessions.map((session) => {
                      const Icon = DEVICE_ICONS[session.kind]
                      const checked = selectedIds.includes(session.id)
                      return (
                        <li
                          key={session.id}
                          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b py-3 last:border-b-0 lg:grid-cols-[auto_minmax(18rem,1fr)_9rem_8rem_5rem] lg:gap-4 lg:px-1"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => toggleSession(session.id, !!value)}
                            aria-label={`Seleccionar ${deviceName(session)}`}
                          />
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground">
                              <Icon className="size-5" />
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold">{deviceName(session)}</span>
                                {session.impersonated && (
                                  <Badge variant="outline" className="border-amber-400/30 text-amber-400">
                                    Soporte
                                  </Badge>
                                )}
                              </div>
                              <p className="truncate text-sm text-muted-foreground">
                                {session.os} · inició {sessionStarted(session.createdAt)}
                                {session.impersonated ? ` · Visita de un superadmin; caduca ${timeUntil(session.expiresAt)}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="col-start-2 text-sm font-medium text-muted-foreground lg:col-auto">{maskedIp(session.ipAddress)}</span>
                          <span className="col-start-3 row-start-1 whitespace-nowrap text-sm font-medium lg:col-auto lg:row-auto">
                            {relativeTime(session.lastSeenAt)}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="col-start-3 row-start-2 border-destructive/35 hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive lg:col-auto lg:row-auto"
                            disabled={pending}
                            onClick={() => setConfirmation({ type: 'single', session })}
                          >
                            Cerrar
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="rounded-2xl border-indigo-400/20 bg-gradient-to-br from-indigo-400/[0.06] via-card to-card shadow-none">
              <CardHeader className="gap-3 pb-2">
                <CardTitle className="flex items-center gap-2.5 text-lg">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-400/15 text-indigo-300">
                    <Shield className="size-4" />
                  </span>
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <SummaryRow label="Sesiones abiertas" value={sessions.length} />
                <SummaryRow label="Activas ahora" value={activeCount} />
                <SummaryRow
                  label="La más reciente"
                  value={newestOther ? `${deviceName(newestOther)} · ${relativeTime(newestOther.lastSeenAt)}` : 'Ninguna'}
                />
                <SummaryRow label="Cada sesión dura" value={`${sessionDurationDays} días`} />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-amber-400/25 bg-gradient-to-br from-amber-400/[0.07] via-card to-card shadow-none">
              <CardHeader className="gap-3 pb-2">
                <CardTitle className="flex items-center gap-2.5 text-lg">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
                    <AlertTriangle className="size-4" />
                  </span>
                  ¿No reconoces una?
                </CardTitle>
                <CardDescription>Ciérrala y cambia tu contraseña desde Perfil.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full">
                  <a href="/configuracion/perfil#contrasena">Cambiar contraseña</a>
                </Button>
                <p className="text-xs font-medium text-amber-400">Aviso por correo de un dispositivo nuevo · Próximamente</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <AlertDialog open={!!confirmation} onOpenChange={(open) => !open && !pending && setConfirmation(null)}>
        <AlertDialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl p-5 sm:max-w-xl sm:p-7">
          <AlertDialogHeader className="flex-row items-start gap-4 space-y-0 text-left">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
              <LogOut aria-hidden="true" className="size-7" />
            </span>
            <div className="space-y-2">
              <AlertDialogTitle className="text-2xl leading-tight">
                {confirmation?.type === 'single'
                  ? `¿Cerrar la sesión de ${deviceName(confirmation.session)}?`
                  : confirmation?.type === 'selected'
                    ? `¿Cerrar ${pluralCount(confirmCount, 'sesión', 'sesiones')}?`
                    : confirmation?.type === 'others'
                      ? '¿Cerrar en los demás dispositivos?'
                      : '¿Cerrar esta sesión?'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                {confirmation?.type === 'single'
                  ? 'Tendrá que iniciar sesión otra vez.'
                  : confirmation?.type === 'selected'
                    ? 'Se desconectan estos dispositivos. Tu sesión actual sigue abierta.'
                    : confirmation?.type === 'others'
                      ? 'Seguirás dentro en este navegador. Los demás pedirán iniciar sesión otra vez.'
                      : 'Saldrás de Kogane en este navegador y tendrás que iniciar sesión otra vez.'}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          {confirmSessions.length > 0 && (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {confirmSessions.map((session) => (
                <li key={session.id} className="flex items-center gap-3 rounded-2xl border bg-muted/35 p-3">
                  <DeviceGlyph kind={session.kind} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{deviceName(session)}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      IP {maskedIp(session.ipAddress)} · último uso {relativeTime(session.lastSeenAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {confirmation?.type === 'others' && (
            <div className="space-y-2 rounded-2xl border border-amber-400/35 bg-amber-400/[0.07] p-4 text-sm">
              <p className="flex items-start gap-2">
                <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-400" />
                Se cerrarán {pluralCount(otherSessions.length, 'sesión', 'sesiones')}: {pluralCount(otherTypeCounts.mobile, 'móvil', 'móviles')},{' '}
                {pluralCount(otherTypeCounts.tablet, 'tablet', 'tabletas')} y{' '}
                {pluralCount(otherTypeCounts.desktop + otherTypeCounts.unknown, 'computadora', 'computadoras')}
                {otherSessions.some((session) => session.impersonated) ? ', incluida una visita de soporte' : ''}.
              </p>
            </div>
          )}

          <AlertDialogFooter className="pt-1">
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={pending || (confirmation?.type === 'selected' && selectedSessions.length === 0)}
              onClick={() => void confirm()}
            >
              {pending
                ? 'Cerrando…'
                : confirmation?.type === 'single' || confirmation?.type === 'current'
                  ? 'Cerrar sesión'
                  : `Cerrar ${confirmation?.type === 'others' ? 'las ' : ''}${pluralCount(confirmCount, 'sesión', 'sesiones')}`}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
