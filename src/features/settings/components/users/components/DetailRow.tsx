import type { ReactNode } from 'react'

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(7rem,1fr)_minmax(0,1.5fr)] items-center gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="min-w-0 font-medium">{children}</div>
    </div>
  )
}
