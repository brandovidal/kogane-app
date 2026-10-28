import { formatCurrency } from '@/shared/lib/currency'
import type { OverviewGroup } from '../lib/budget-overview'

const GROUP_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)']

export function BudgetAllocationBar({ groups, salary }: { groups: OverviewGroup[]; salary: number }) {
  const assigned = groups.reduce((sum, group) => sum + group.percentage, 0)
  return (
    <section className="space-y-3 rounded-xl border bg-card px-4 py-3.5" aria-label="Reparto del sueldo">
      <div className="flex items-center justify-between gap-3 text-sm">
        <h2 className="font-semibold">Cómo se reparte el sueldo</h2>
        <span className="text-xs text-muted-foreground">
          Total {assigned} % · {formatCurrency(salary)}
        </span>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        {groups.map((group, index) => (
          <span
            key={group.id}
            style={{ width: `${Math.min(group.percentage, 100)}%`, backgroundColor: GROUP_COLORS[index % GROUP_COLORS.length] }}
            className="border-r border-background/80 last:border-0"
          />
        ))}
        {assigned < 100 && <span style={{ width: `${100 - assigned}%` }} className="bg-muted-foreground/15" />}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {groups.map((group, index) => (
          <li key={group.id} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-sm" style={{ backgroundColor: GROUP_COLORS[index % GROUP_COLORS.length] }} />
            {group.name} <strong className="font-medium text-foreground">{group.percentage} %</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}
