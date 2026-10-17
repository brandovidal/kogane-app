import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { cn } from '@/shared/utils/cn'

const tones = {
  personal: {
    card: 'border-t-indigo-400/80 bg-gradient-to-b from-indigo-500/[0.09] via-card to-card',
    icon: 'bg-indigo-500/15 text-indigo-300',
  },
  account: {
    card: 'border-t-violet-400/80 bg-gradient-to-b from-violet-500/[0.09] via-card to-card',
    icon: 'bg-violet-500/15 text-violet-300',
  },
  app: {
    card: 'border-t-teal-400/80 bg-gradient-to-b from-teal-500/[0.08] via-card to-card',
    icon: 'bg-teal-500/15 text-teal-300',
  },
  password: {
    card: 'border-t-amber-400/80 bg-gradient-to-b from-amber-500/[0.08] via-card to-card',
    icon: 'bg-amber-500/15 text-amber-300',
  },
  telegram: {
    card: 'border-t-sky-400/80 bg-gradient-to-b from-sky-500/[0.08] via-card to-card',
    icon: 'bg-sky-500/15 text-sky-300',
  },
  session: {
    card: 'border-t-rose-400/80 bg-gradient-to-b from-rose-500/[0.08] via-card to-card',
    icon: 'bg-rose-500/15 text-rose-300',
  },
} as const

export type ProfileCardTone = keyof typeof tones

export function ProfileAccentCard({
  tone,
  children,
  className,
  id,
}: {
  tone: ProfileCardTone
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <Card
      id={id}
      className={cn(
        'relative gap-0 overflow-hidden rounded-2xl border-t-2 border-x-border/80 border-b-border/80 py-0 shadow-sm shadow-black/10',
        tones[tone].card,
        className,
      )}
    >
      {children}
    </Card>
  )
}

export function ProfileAccentHeader({
  tone,
  icon: Icon,
  title,
  description,
}: {
  tone: ProfileCardTone
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <CardHeader className="grid grid-cols-[2.25rem_minmax(0,1fr)] grid-rows-[auto] items-start gap-x-3 gap-y-0 px-5 pt-5 pb-4 sm:px-5">
      <span className={cn('flex size-9 items-center justify-center rounded-lg', tones[tone].icon)}>
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 space-y-1.5">
        <CardTitle className="text-base leading-5">{title}</CardTitle>
        <CardDescription className="text-sm leading-5">{description}</CardDescription>
      </div>
    </CardHeader>
  )
}

export function profileIconTone(tone: ProfileCardTone) {
  return tones[tone].icon
}
