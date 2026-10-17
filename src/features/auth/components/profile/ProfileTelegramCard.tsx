import { useState } from 'react'
import { Check, ExternalLink, Send } from 'lucide-react'
import { useTelegramLink, useUnlinkTelegram, type useMe } from '@/features/auth/hooks/auth'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'

export function ProfileTelegramCard({ user }: { user: NonNullable<ReturnType<typeof useMe>['data']> }) {
  const telegramLink = useTelegramLink()
  const unlink = useUnlinkTelegram()
  const [link, setLink] = useState<{ url: string; expiresAt: string } | null>(null)

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Telegram</CardTitle>
        <CardDescription>
          El bot guarda lo que le mandes en tu cuenta, no en la de otros.{' '}
          {user.telegramLinked ? 'Este chat ya está vinculado.' : 'Vincula tu chat para usarlo.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {user.telegramLinked && (
          <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
            <Check aria-hidden="true" className="size-3.5" /> Chat vinculado
          </Badge>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={user.telegramLinked ? 'outline' : 'default'}
            onClick={() =>
              telegramLink.mutate(undefined, {
                onSuccess: (created) => setLink(created),
              })
            }
            disabled={telegramLink.isPending}
          >
            <Send aria-hidden="true" className="size-4" />
            {telegramLink.isPending ? 'Generando enlace…' : user.telegramLinked ? 'Vincular otro chat' : 'Vincular Telegram'}
          </Button>
          {user.telegramLinked && (
            <Button
              type="button"
              variant="outline"
              disabled={unlink.isPending}
              onClick={() => {
                if (window.confirm('¿Desvincular Telegram de tu cuenta?')) {
                  unlink.mutate()
                }
              }}
            >
              {unlink.isPending ? 'Desvinculando…' : 'Desvincular'}
            </Button>
          )}
        </div>
        {link && (
          <p className="text-sm">
            <a
              className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-2"
              href={link.url}
              target="_blank"
              rel="noreferrer"
            >
              Abrir el bot con tu código
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>{' '}
            <span className="text-muted-foreground">
              (sirve una vez y vence a las{' '}
              {new Date(link.expiresAt).toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              )
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
