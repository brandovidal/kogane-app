import { type ReactNode } from 'react'
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { cn } from '@/shared/utils/cn'
import { useSettingsNavigation } from '../../hooks/useSettingsNavigation'
import { SETTINGS_NAV_GROUPS, settingsHref } from '../../constants/sections'
import type { SettingsSection } from '../../types/navigation'

export function SettingsShell({
  section,
  isAdmin,
  wide = false,
  children,
}: {
  section: SettingsSection
  isAdmin: boolean
  wide?: boolean
  children: ReactNode
}) {
  const { rail, folded: foldedGroups, update } = useSettingsNavigation()

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <nav
        aria-label="Ajustes"
        className={cn(
          'shrink-0 md:rounded-2xl md:bg-linear-to-b md:from-indigo-500/9 md:via-card/40 md:to-transparent md:p-4',
          rail ? 'md:w-16' : 'md:w-64',
        )}
      >
        <div className="mb-4 flex items-center justify-between px-1">
          {!rail && <h2 className="text-base font-semibold tracking-tight">Ajustes</h2>}
          <button
            type="button"
            className="hidden size-10 items-center justify-center rounded-xl border border-border/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
            aria-label={rail ? 'Expandir menú' : 'Contraer menú'}
            onClick={() => update({ rail: !rail, folded: foldedGroups })}
          >
            {rail ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto md:block md:space-y-5 md:overflow-visible">
          {SETTINGS_NAV_GROUPS.map((group) => {
            const items = group.items.filter((i) => !i.adminOnly || isAdmin)
            if (items.length === 0) return null
            const folded = !rail && foldedGroups.includes(group.label)
            return (
              <div key={group.label} className="flex gap-1 md:block">
                {!rail && (
                  <button
                    type="button"
                    aria-expanded={!folded}
                    className="hidden w-full items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:flex"
                    onClick={() =>
                      update({
                        rail,
                        folded: folded ? foldedGroups.filter((l) => l !== group.label) : [...foldedGroups, group.label],
                      })
                    }
                  >
                    {group.label}
                    <ChevronDown className={cn('h-3 w-3 transition', folded && '-rotate-90')} />
                  </button>
                )}
                {!folded &&
                  items.map(({ key, label, icon: Icon, href, endIcon: EndIcon, badge }) => (
                    <a
                      key={key}
                      href={href ?? settingsHref(key)}
                      title={label}
                      aria-current={key === section ? 'page' : undefined}
                      className={cn(
                        'flex min-h-10 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted/70',
                        key === section && 'bg-muted font-semibold text-foreground shadow-sm',
                        rail && 'md:justify-center md:px-0',
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className={cn('flex-1', rail && 'md:sr-only')}>{label}</span>
                      {badge && !rail && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">{badge}</span>}
                      {EndIcon && !rail && <EndIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                    </a>
                  ))}
              </div>
            )
          })}
        </div>
      </nav>
      <div className={`min-w-0 flex-1 ${wide ? 'w-full' : 'max-w-4xl'}`}>{children}</div>
    </div>
  )
}
