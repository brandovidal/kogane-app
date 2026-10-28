import { Ban, Eye, Shield, X } from 'lucide-react'
import { InlineAlert } from '@/shared/components'
import { InlineAlertDescription } from '@/shared/components'
import { Button } from '@/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'
import { ROLE_LABELS } from '../constants'
import type { Confirmation } from '../types'

export function ConfirmationDialog({
  confirmation,
  onClose,
  onConfirm,
  pending,
  lastAdminCount,
}: {
  confirmation: Confirmation | null
  onClose: () => void
  onConfirm: () => void
  pending: boolean
  lastAdminCount: number
}) {
  if (!confirmation) return null
  const { title, description, action, warning } = (() => {
    switch (confirmation.kind) {
      case 'role': {
        const { user, role } = confirmation
        return {
          title: `¿Cambiar a ${user.name} a ${ROLE_LABELS[role]}?`,
          description: `${user.name} · ${user.email}`,
          action: `Cambiar a ${ROLE_LABELS[role]}`,
          warning:
            user.role === 'admin' && role === 'member' && lastAdminCount <= 1
              ? 'No se puede quitar el rol admin a la última persona administradora.'
              : null,
        }
      }
      case 'status': {
        const { user, status } = confirmation
        return {
          title: status === 'disabled' ? `¿Deshabilitar a ${user.name}?` : `¿Reactivar a ${user.name}?`,
          description: user.email,
          action: status === 'disabled' ? 'Deshabilitar' : 'Reactivar',
          warning:
            status === 'disabled' && user.role === 'admin' && lastAdminCount <= 1
              ? 'No se puede deshabilitar a la última persona con rol admin.'
              : null,
        }
      }
      case 'revoke':
        return {
          title: '¿Cancelar esta invitación?',
          description: `${confirmation.invite.email}. El enlace dejará de funcionar y la persona necesitará una invitación nueva.`,
          action: 'Cancelar invitación',
          warning: null,
        }
      case 'impersonate':
        return {
          title: `Entrar como ${confirmation.user.name}`,
          description: 'Solo superadmin · sesión de soporte de 4 horas. Todo lo que cambies quedará en el historial con tu nombre como autor.',
          action: `Entrar como ${confirmation.user.name}`,
          warning: null,
        }
    }
  })()
  return (
    <AlertDialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl sm:p-8">
        <AlertDialogHeader className="text-left">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
              {confirmation.kind === 'impersonate' ? (
                <Eye className="size-7" />
              ) : confirmation.kind === 'revoke' ? (
                <X className="size-7" />
              ) : (
                <Shield className="size-7" />
              )}
            </span>
            <div className="space-y-1">
              <AlertDialogTitle className="text-2xl">{title}</AlertDialogTitle>
              <AlertDialogDescription className="text-base">{description}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        {confirmation.kind === 'role' && confirmation.role === 'admin' && (
          <ul className="space-y-2 pl-8 text-sm text-muted-foreground">
            <li>• Ver la lista de usuarios e invitaciones</li>
            <li>• Invitar y revocar invitaciones</li>
            <li>• Cambiar el rol y deshabilitar a otros usuarios</li>
          </ul>
        )}
        {confirmation.kind === 'status' && confirmation.status === 'disabled' && (
          <ul className="space-y-2 pl-8 text-sm text-muted-foreground">
            <li>• Se cierran sus sesiones y no podrá volver a entrar.</li>
            <li>• Sus datos se conservan y puedes reactivarlo cuando quieras.</li>
            <li>• Su chat de Telegram deja de responder hasta que lo reactives.</li>
          </ul>
        )}
        {warning ? (
          <InlineAlert className="border-destructive/40 bg-destructive/5 text-red-300">
            <Ban className="size-4" />
            <InlineAlertDescription>{warning}</InlineAlertDescription>
          </InlineAlert>
        ) : confirmation.kind === 'role' && confirmation.role === 'admin' ? (
          <InlineAlert className="border-primary/30 bg-primary/5 text-primary">
            <Shield className="size-4" />
            <InlineAlertDescription>
              Seguirá viendo solo sus propios datos. Puedes volver a dejarlo como miembro cuando quieras.
            </InlineAlertDescription>
          </InlineAlert>
        ) : confirmation.kind === 'impersonate' ? (
          <InlineAlert className="border-amber-500/30 bg-amber-500/5 text-amber-300">
            <Eye className="size-4" />
            <InlineAlertDescription>
              {confirmation.user.name} verá esta sesión en su lista de dispositivos como «Visita de un superadmin».
            </InlineAlertDescription>
          </InlineAlert>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <Button
            variant={confirmation.kind === 'status' && confirmation.status === 'disabled' ? 'destructive' : 'default'}
            disabled={pending || !!warning}
            onClick={onConfirm}
          >
            {pending ? 'Guardando…' : action}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
