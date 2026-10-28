import { Badge } from '@/ui/badge'
import { ROLE_LABELS } from '../constants'
import type { User } from '../types'
import { cn } from '@/shared/utils/cn'

export function RoleBadge({ role }: { role: User['role'] }) {
  return (
    <Badge
      className={cn(
        'rounded-full border-0 px-3',
        role === 'admin' && 'bg-primary/15 text-primary',
        role === 'superadmin' && 'bg-foreground/10 text-foreground',
        role === 'member' && 'bg-muted text-muted-foreground',
      )}
    >
      {ROLE_LABELS[role]}
    </Badge>
  )
}
