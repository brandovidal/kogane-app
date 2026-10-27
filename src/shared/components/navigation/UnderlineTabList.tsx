import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

export interface UnderlineTabItem {
  key: string
  label: ReactNode
  count?: ReactNode
  href?: string
  onSelect?: () => void
}

export interface UnderlineTabListProps {
  items: readonly UnderlineTabItem[]
  activeKey: string
  ariaLabel: string
  className?: string
}

export function UnderlineTabList({ items, activeKey, ariaLabel, className }: UnderlineTabListProps) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn('grid border-b', className)} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((item) => {
        const active = item.key === activeKey
        const classes = cn(
          '-mb-px flex min-w-0 items-center justify-center gap-2 border-b-2 px-2 py-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground sm:px-4',
          active ? 'border-primary text-foreground' : 'border-transparent',
        )
        const content = (
          <>
            <span>{item.label}</span>
            {item.count !== undefined && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">{item.count}</span>}
          </>
        )
        return item.href ? (
          <a key={item.key} role="tab" href={item.href} aria-selected={active} className={classes}>{content}</a>
        ) : (
          <button key={item.key} type="button" role="tab" aria-selected={active} className={classes} onClick={item.onSelect}>{content}</button>
        )
      })}
    </div>
  )
}
