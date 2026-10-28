import { Mail } from 'lucide-react'
import { InlineAlert } from '@/shared/components'
import { InlineAlertDescription } from '@/shared/components'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { RoleBadge } from './RoleBadge'
import { dateRemaining } from '../lib'
import type { Invite } from '../types'
import { cn } from '@/shared/utils/cn'

export function InviteTable({
  invites,
  onRevoke,
  onRenew,
  hydrated,
}: {
  invites: Invite[]
  onRevoke: (invite: Invite) => void
  onRenew: (invite: Invite) => void
  hydrated: boolean
}) {
  return (
    <>
      <InlineAlert className="border-primary/30 bg-primary/5 text-primary">
        <Mail className="size-4" />
        <InlineAlertDescription>
          Cada invitación vale 7 días y se usa una sola vez. Quien la abre entra con Google o elige una contraseña; el correo de la cuenta es el de la
          invitación.
        </InlineAlertDescription>
      </InlineAlert>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-muted-foreground">
              <th className="px-5 py-3 font-medium">Invitación</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Envío</th>
              <th className="px-4 py-3 font-medium">Vence</th>
              <th className="w-52 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {invites.map((invite) => {
              const expired = hydrated && new Date(invite.expiresAt).getTime() < Date.now()
              return (
                <tr key={invite.id} className="hover:bg-muted/20">
                  <td className="px-5 py-4 font-semibold">{invite.email}</td>
                  <td className="px-4 py-4">
                    <RoleBadge role={invite.role} />
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={cn('rounded-full border-0', expired ? 'bg-destructive/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300')}>
                      <span className="mr-2 size-1.5 rounded-full bg-current" />
                      {expired ? 'Vencida' : 'Invitación activa'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={cn('rounded-full border-0', expired ? 'bg-destructive/15 text-red-300' : 'bg-amber-500/15 text-amber-300')}>
                      {hydrated ? dateRemaining(invite.expiresAt) : '—'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {expired && (
                        <Button variant="outline" size="sm" onClick={() => onRenew(invite)}>
                          Invitar de nuevo
                        </Button>
                      )}
                      <Button variant="outline" size="sm" aria-label={`Cancelar invitación de ${invite.email}`} onClick={() => onRevoke(invite)}>
                        Cancelar
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {invites.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                  No hay invitaciones pendientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
