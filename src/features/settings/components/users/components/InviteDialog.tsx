import { useEffect, useState } from 'react'
import { Link2, Mail } from 'lucide-react'
import { InlineAlert } from '@/shared/components'
import { InlineAlertDescription } from '@/shared/components'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
import { Input } from '@/ui/input'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'
import type { InviteDraft } from '../types'
import { cn } from '@/shared/utils/cn'

export function InviteDialog({
  open,
  onOpenChange,
  mailEnabled,
  onSubmit,
  pending,
  initialInvite,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mailEnabled: boolean
  onSubmit: (input: InviteDraft & { send: boolean }) => void
  pending: boolean
  initialInvite: { email: string; role: 'member' | 'admin' } | null
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member' | 'admin'>('member')
  const [send, setSend] = useState(true)
  useEffect(() => {
    if (open) {
      setEmail(initialInvite?.email ?? '')
      setRole(initialInvite?.role ?? 'member')
    }
  }, [initialInvite, open])
  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit({ email: email.trim(), role, send })
  }
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl sm:p-8">
        <form onSubmit={submit} className="space-y-6">
          <AlertDialogHeader className="text-left">
            <div className="flex items-center gap-4">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Mail className="size-7" />
              </span>
              <div>
                <AlertDialogTitle className="text-2xl">Invitar usuario</AlertDialogTitle>
                <AlertDialogDescription className="text-base">Le llega un enlace para crear su cuenta.</AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="space-y-5">
            <label className="block space-y-2 text-sm font-medium">
              Correo
              <Input
                autoFocus
                type="email"
                placeholder="nombre@ejemplo.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium">Rol</p>
              <div className="inline-flex rounded-xl border p-1">
                <button
                  type="button"
                  aria-pressed={role === 'member'}
                  className={cn('rounded-lg px-4 py-2 text-sm', role === 'member' && 'bg-muted font-semibold')}
                  onClick={() => setRole('member')}
                >
                  Miembro
                </button>
                <button
                  type="button"
                  aria-pressed={role === 'admin'}
                  className={cn('rounded-lg px-4 py-2 text-sm', role === 'admin' && 'bg-muted font-semibold')}
                  onClick={() => setRole('admin')}
                >
                  Admin
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Un miembro usa Kogane con sus propios datos. Un admin además invita y gestiona usuarios.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <Checkbox checked={send} onCheckedChange={(checked) => setSend(checked === true)} />
              Enviar el enlace por correo
            </label>
            <InlineAlert className="border-primary/30 bg-primary/5 text-primary">
              <Link2 className="size-4" />
              <InlineAlertDescription>
                El enlace vale 7 días y se usa una sola vez.{' '}
                {mailEnabled
                  ? 'Si el correo no sale, igual podrás copiar el enlace y mandarlo tú.'
                  : 'No hay correo configurado: podrás copiar el enlace y mandarlo tú.'}
              </InlineAlertDescription>
            </InlineAlert>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <Button type="submit" disabled={pending || !email.trim()}>
              <Mail className="mr-2 size-4" />
              {pending ? 'Creando…' : 'Crear invitación'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
