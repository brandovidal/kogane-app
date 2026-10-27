import { Fragment, useEffect, useState } from 'react'
import { Check, ExternalLink, Send } from 'lucide-react'

import { useMe } from '@/features/auth/hooks/auth'
import { useNotificationSettings, useUpdateNotificationSettings } from '@/features/notifications/hooks/notifications'
import type { NotificationKind } from '@/shared/api/types'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Switch } from '@/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { NOTIFICATION_GROUPS } from './constants'

type Channel = 'telegram' | 'web'

export function NotificationSettingsCard() {
  const [hasHydrated, setHasHydrated] = useState(false)
  const notificationQuery = useNotificationSettings()
  const settings = notificationQuery.data
  const update = useUpdateNotificationSettings()
  const { data: me } = useMe()
  useEffect(() => setHasHydrated(true), [])
  const telegramLinked = hasHydrated && (me?.telegramLinked ?? false)

  const toggle = (kind: NotificationKind, channel: Channel, value: boolean) => update.mutate({ [kind]: { [channel]: value } })

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Notificaciones</h1>
        <p className="text-sm text-muted-foreground">
          Qué avisos llegan al bot de Telegram y a la campana de la web. En el bot también puedes usar /avisos.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card px-4 py-3 sm:px-5" aria-label="Estado de Telegram">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Send aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-48 flex-1">
          <h2 className="text-sm font-semibold">Telegram {telegramLinked ? 'vinculado' : 'sin vincular'}</h2>
          <p className="text-sm text-muted-foreground">
            {telegramLinked
              ? 'Los avisos llegan al chat que vinculaste en tu Perfil.'
              : 'Vincula un chat en tu Perfil para recibir avisos de Telegram.'}
          </p>
        </div>
        <Badge className={telegramLinked ? 'gap-1.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15' : 'bg-muted text-muted-foreground'}>
          {telegramLinked && <Check aria-hidden="true" className="size-3" />}
          {telegramLinked ? 'Chat vinculado' : 'Sin vincular'}
        </Badge>
        <a
          href="/configuracion/perfil"
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {telegramLinked ? 'Gestionar en Perfil' : 'Vincular en Perfil'}
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </section>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {notificationQuery.isLoading ? (
          <div className="space-y-5 p-5" aria-label="Cargando preferencias de notificaciones">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded-lg bg-muted/60" />
            ))}
          </div>
        ) : notificationQuery.isError ? (
          <div className="flex flex-col items-start gap-3 p-6">
            <p className="text-sm text-muted-foreground">No se pudieron cargar tus preferencias de notificaciones.</p>
            <Button type="button" variant="outline" size="sm" onClick={() => notificationQuery.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/35">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-11 px-4 text-muted-foreground sm:px-5">Aviso</TableHead>
                <TableHead className="w-24 px-2 text-center text-muted-foreground sm:w-32">Telegram</TableHead>
                <TableHead className="w-20 px-2 text-center text-muted-foreground sm:w-28">Web</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {NOTIFICATION_GROUPS.map((group) => (
                <Fragment key={group.label}>
                  <TableRow className="border-y bg-muted/25 hover:bg-muted/25">
                    <TableCell colSpan={3} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/90 sm:px-5">
                      {group.label}
                    </TableCell>
                  </TableRow>
                  {group.items.map(({ kind, title, description }) => (
                    <TableRow key={kind} className="hover:bg-muted/20">
                      <TableCell className="whitespace-normal px-4 py-3 sm:px-5">
                        <div className="font-medium leading-5">{title}</div>
                        <p className="text-sm leading-5 text-muted-foreground">{description}</p>
                      </TableCell>
                      {(['telegram', 'web'] as Channel[]).map((channel) => (
                        <TableCell key={channel} className="px-2 text-center">
                          <span className="inline-flex min-w-14 justify-center rounded-md bg-muted/55 px-2 py-1.5">
                            <Switch
                              size="default"
                              className="h-7 w-12 data-[state=checked]:bg-indigo-300 data-[state=unchecked]:bg-muted-foreground/30"
                              thumbClassName="size-5 data-[state=checked]:bg-background dark:data-[state=checked]:bg-neutral-950"
                              checked={settings?.[kind]?.[channel] ?? false}
                              disabled={!settings || update.isPending}
                              onCheckedChange={(value) => toggle(kind, channel, value)}
                              aria-label={`${title} por ${channel === 'web' ? 'la web' : 'Telegram'}`}
                            />
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
