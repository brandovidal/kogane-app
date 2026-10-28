import { cn } from '@/shared/utils/cn'
import type { UserTab } from '../types'

export function TabNav({
  tab,
  onTab,
  userCount,
  inviteCount,
}: {
  tab: UserTab
  onTab: (tab: UserTab) => void
  userCount: number
  inviteCount: number
}) {
  const items = [
    { key: 'users' as const, label: 'Usuarios', count: userCount },
    { key: 'invites' as const, label: 'Invitaciones', count: inviteCount },
    { key: 'roles' as const, label: 'Roles y permisos' },
  ]
  return (
    <div role="tablist" aria-label="Administración de usuarios" className="inline-flex max-w-full flex-wrap rounded-xl border bg-background p-1">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={tab === item.key}
          onClick={() => onTab(item.key)}
          className={cn(
            'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-4',
            tab === item.key && 'bg-muted text-foreground shadow-sm',
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">{item.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
