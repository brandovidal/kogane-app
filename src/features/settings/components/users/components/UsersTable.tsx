import { Avatar, AvatarFallback } from '@/ui/avatar'
import { Button } from '@/ui/button'
import { RoleBadge } from './RoleBadge'
import { StatusBadge } from './StatusBadge'
import { dateLabel, initials } from '../lib'
import type { User } from '../types'

export function UsersTable({
  users,
  currentUserId,
  onView,
  hydrated,
}: {
  users: User[]
  currentUserId: string
  onView: (user: User) => void
  hydrated: boolean
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-left text-muted-foreground">
            <th className="px-5 py-3 font-medium">Usuario</th>
            <th className="px-4 py-3 font-medium">Rol</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Último acceso</th>
            <th className="w-20 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr key={user.id} className="transition-colors hover:bg-muted/20">
              <td className="px-5 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-10 shrink-0 bg-muted">
                    <AvatarFallback className="text-xs font-semibold">{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {user.name}
                      {user.id === currentUserId && <span className="ml-1 text-muted-foreground">(tú)</span>}
                    </p>
                    <p className="truncate text-muted-foreground">
                      {user.email}
                      {user.phone ? ` · ${user.phone}` : ''}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <RoleBadge role={user.role} />
              </td>
              <td className="px-4 py-3.5">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3.5">
                <p className="font-medium">{hydrated ? dateLabel(user.lastLoginAt) : '—'}</p>
                <p className="text-muted-foreground">{user.telegramLinked ? 'Telegram vinculado' : 'Sin Telegram'}</p>
              </td>
              <td className="px-4 py-3.5 text-right">
                <Button variant="outline" size="sm" onClick={() => onView(user)}>
                  Ver
                </Button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                No hay usuarios que coincidan con la búsqueda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
