import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

export interface InlineAlertProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'destructive'
}

export function InlineAlert({ children, className, variant = 'default' }: InlineAlertProps) {
  return (
    <div
      role={variant === 'destructive' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-xl border p-4 text-sm', className)}
    >
      {children}
    </div>
  )
}

export function InlineAlertDescription({ children }: { children: ReactNode }) {
  return <div className="min-w-0 flex-1">{children}</div>
}
