import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, Copy, Mail, UserPlus } from 'lucide-react'
import { InlineAlert } from '@/shared/components'
import { InlineAlertDescription } from '@/shared/components'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card } from '@/ui/card'
import { Input } from '@/ui/input'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/ui/alert-dialog'
import { ROLE_LABELS } from '../constants'
import type { InviteResult } from '../types'
import { cn } from '@/shared/utils/cn'

export function InviteCreatedDialog({
  result,
  onClose,
  onInviteAnother,
}: {
  result: InviteResult | null
  onClose: () => void
  onInviteAnother: () => void
}) {
  const [copied, setCopied] = useState(false)
  useEffect(() => setCopied(false), [result])
  if (!result) return null
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(result.url)
      setCopied(true)
      toast.success('Enlace copiado')
    } catch {
      toast.error('No se pudo copiar el enlace')
    }
  }
  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-border/80 bg-background p-5 shadow-2xl sm:max-w-[980px] sm:p-8">
        <div className="space-y-6">
          <AlertDialogHeader className="text-left">
            <div className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Check className="size-7" />
              </span>
              <div className="min-w-0 space-y-1">
                <AlertDialogTitle className="text-2xl font-semibold tracking-tight">Invitación creada</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Para {result.email} · rol {ROLE_LABELS[result.role]} · vale 7 días.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <section className="space-y-2" aria-label="Enlace de invitación">
            <label htmlFor="created-invite-url" className="text-sm font-semibold">
              Enlace de invitación
            </label>
            <div className="flex min-w-0 flex-col gap-2 rounded-xl border bg-muted/30 p-2 sm:flex-row sm:items-center">
              <Input
                id="created-invite-url"
                readOnly
                value={result.url}
                onFocus={(event) => event.currentTarget.select()}
                aria-label="Enlace de invitación"
                className="h-10 min-w-0 flex-1 border-0 bg-transparent font-mono text-sm shadow-none focus-visible:ring-0"
              />
              <Button type="button" variant="outline" onClick={copyLink} className="h-10 shrink-0">
                <Copy className="mr-2 size-4" />
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Quien lo abre entra con Google o elige una contraseña.</p>
          </section>

          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0 space-y-0.5">
              <h3 className="font-semibold">{result.emailed ? 'Correo enviado' : 'Correo no enviado'}</h3>
              <p className="text-sm text-muted-foreground">
                {result.emailed
                  ? `Salió a ${result.email} hace unos segundos.`
                  : `No se pudo enviar a ${result.email}. Comparte el enlace directamente.`}
              </p>
            </div>
            <Badge
              className={cn(
                'shrink-0 gap-2 rounded-full border-0 px-3 py-1',
                result.emailed ? 'bg-emerald-500/15 text-emerald-300' : 'bg-destructive/15 text-red-300',
              )}
            >
              <span className="size-2 rounded-full bg-current" />
              {result.emailed ? 'Enviado' : 'No se pudo enviar'}
            </Badge>
          </Card>

          {!result.emailed && (
            <InlineAlert className="border-amber-500/40 bg-amber-500/10 text-amber-200">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <InlineAlertDescription>
                La invitación sigue creada aunque falle el correo. Copia el enlace y compártelo por otro medio, como WhatsApp.
              </InlineAlertDescription>
            </InlineAlert>
          )}

          <AlertDialogFooter className="pt-1">
            <Button variant="outline" onClick={onInviteAnother}>
              <UserPlus className="mr-2 size-4" />
              Invitar a otra persona
            </Button>
            <Button onClick={onClose}>Listo</Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
