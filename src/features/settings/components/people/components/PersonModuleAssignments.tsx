import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { Badge } from '@/ui/badge'
import { Checkbox } from '@/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { PERSON_DEBTS_LABEL, PERSON_MODULES } from '../constants'
import type { PersonModuleAssignmentsProps } from '../types'

export function PersonModuleAssignments({ person, disabled = false, onChange }: PersonModuleAssignmentsProps) {
  const [open, setOpen] = useState(false)
  const assigned = person.isDefault ? PERSON_MODULES.map(([key]) => key) : person.appearsIn
  const toggle = (key: (typeof PERSON_MODULES)[number][0]) =>
    onChange(assigned.includes(key) ? assigned.filter((item) => item !== key) : [...assigned, key])
  return (
    <div className="flex min-w-56 items-center gap-1.5">
      <div className="flex min-w-0 flex-wrap gap-1">
        {PERSON_MODULES.filter(([key]) => assigned.includes(key)).map(([key, label]) => (
          <Badge key={key} variant="secondary" className="text-primary">
            {label}
          </Badge>
        ))}
        <Badge variant="outline" className="text-muted-foreground">
          {PERSON_DEBTS_LABEL}
        </Badge>
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          disabled={disabled || person.isDefault}
          aria-label={`Editar asignaciones de ${person.name}`}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-dashed text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="size-3.5" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-2">
          <p className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{person.name} aparece en</p>
          {PERSON_MODULES.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
            >
              <Checkbox checked={assigned.includes(key)} tabIndex={-1} aria-hidden="true" />
              {label}
            </button>
          ))}
          <div className="mt-1 flex items-center justify-between border-t px-2 pt-2 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Check className="size-3" />
              {PERSON_DEBTS_LABEL} · Siempre
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => onChange(PERSON_MODULES.map(([key]) => key))}>
                Marcar todas
              </button>
              <button type="button" className="text-muted-foreground" onClick={() => onChange([])}>
                Limpiar
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
