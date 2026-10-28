import { Ban, Eye } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/ui/avatar'
import { InlineAlert } from '@/shared/components'
import { InlineAlertDescription } from '@/shared/components'
import { Button } from '@/ui/button'
import { Card } from '@/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/ui/sheet'
import { DetailRow } from './DetailRow'
import { RoleBadge } from './RoleBadge'
import { StatusBadge } from './StatusBadge'
import { dateLabel, initials } from '../lib'
import type { User } from '../types'

export function UserDetail({
  user,
  onClose,
  onRole,
  onStatus,
  onImpersonate,
  busy,
  isLastAdmin,
  canImpersonate,
}: {
  user: User | null
  onClose: () => void
  onRole: (role: 'admin' | 'member') => void
  onStatus: (status: 'active' | 'disabled') => void
  onImpersonate: () => void
  busy: boolean
  isLastAdmin: boolean
  canImpersonate: boolean
}) {
  return (
    <Sheet open={!!user} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto border-l bg-background p-0 sm:max-w-xl">
        {user && (
          <>
            <SheetHeader className="border-b px-6 py-6 pr-14 text-left">
              <div className="flex items-center gap-4">
                <Avatar className="size-14 bg-muted">
                  <AvatarFallback className="font-semibold">{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="text-xl">{user.name}</SheetTitle>
                  <SheetDescription className="truncate">{user.email}</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <div className="space-y-7 p-6">
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Cuenta</h3>
                <DetailRow label="Rol">
                  {user.role === 'superadmin' ? (
                    <RoleBadge role={user.role} />
                  ) : (
                    <Select value={user.role} onValueChange={(value) => onRole(value as 'admin' | 'member')}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Miembro</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </DetailRow>
                <DetailRow label="Estado">
                  <StatusBadge status={user.status} />
                </DetailRow>
                <DetailRow label="Celular">{user.phone || '—'}</DetailRow>
                <DetailRow label="Documento">{user.documentMasked || '—'}</DetailRow>
                <DetailRow label="Google">{user.googleLinked ? 'Vinculado' : 'Sin vincular'}</DetailRow>
                <DetailRow label="Telegram">
                  <span className={user.telegramLinked ? 'text-emerald-300' : 'text-muted-foreground'}>
                    {user.telegramLinked ? 'Vinculado' : 'Sin vincular'}
                  </span>
                </DetailRow>
                <DetailRow label="Último acceso">{dateLabel(user.lastLoginAt)}</DetailRow>
                <DetailRow label="Contraseña">{user.hasPassword ? 'Configurada' : 'Sin configurar'}</DetailRow>
              </section>
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Sesiones</h3>
                <Card className="space-y-1 p-4">
                  <p className="font-semibold">La lista de sesiones no está disponible aquí</p>
                  <p className="text-sm text-muted-foreground">
                    Esta vista de Perfil → Dispositivos permite administrar las sesiones de la cuenta conectada.
                  </p>
                </Card>
              </section>
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Acciones</h3>
                {canImpersonate && user.status === 'active' && (
                  <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-semibold">Entrar como {user.name}</p>
                      <p className="text-sm text-muted-foreground">Solo superadmin · sesión de soporte de 4 horas.</p>
                    </div>
                    <Button variant="outline" onClick={onImpersonate} disabled={busy}>
                      <Eye className="mr-2 size-4" />
                      Entrar como
                    </Button>
                  </Card>
                )}
                {user.status !== 'invited' && (
                  <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-semibold">{user.status === 'disabled' ? 'Reactivar usuario' : 'Deshabilitar usuario'}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.status === 'disabled' ? 'Podrá volver a entrar y usar su cuenta.' : 'Cierra sus sesiones. Sus datos se conservan.'}
                      </p>
                    </div>
                    <Button
                      variant={user.status === 'disabled' ? 'outline' : 'destructive'}
                      onClick={() => onStatus(user.status === 'disabled' ? 'active' : 'disabled')}
                      disabled={busy || (isLastAdmin && user.status === 'active')}
                    >
                      <Ban className="mr-2 size-4" />
                      {user.status === 'disabled' ? 'Reactivar' : 'Deshabilitar'}
                    </Button>
                  </Card>
                )}
                {isLastAdmin && user.status === 'active' && (
                  <InlineAlert className="border-destructive/40 bg-destructive/5 text-red-300">
                    <InlineAlertDescription>No se puede deshabilitar a la última persona con rol admin.</InlineAlertDescription>
                  </InlineAlert>
                )}
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
