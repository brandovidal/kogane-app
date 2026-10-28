import { Badge } from '@/ui/badge'
import { STATUS_LABELS } from '../constants'
import type { User } from '../types'
import { cn } from '@/shared/utils/cn'

export function StatusBadge({ status }: { status: User['status'] }) {
  const active = status === 'active'
  return (
    <Badge
      className={cn(
        'w-fit min-w-28 justify-start gap-2 rounded-full border-0 px-3',
        active ? 'bg-emerald-500/15 text-emerald-300' : status === 'disabled' ? 'bg-destructive/15 text-red-300' : 'bg-amber-500/15 text-amber-300',
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </Badge>
  )
}
