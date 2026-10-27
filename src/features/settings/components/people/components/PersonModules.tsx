import { Badge } from '@/ui/badge'
import { PERSON_DEBTS_LABEL, PERSON_MODULE_KEYS, PERSON_MODULES } from '../constants'
import type { PersonModulesProps } from '../types'

export function PersonModules({ person, compact = false }: PersonModulesProps) {
  const assigned = person.isDefault ? PERSON_MODULE_KEYS : person.appearsIn
  return (
    <div className="flex flex-wrap gap-1.5">
      {PERSON_MODULES.filter(([key]) => assigned.includes(key)).map(([key, label]) => (
        <Badge key={key} variant="secondary" className="text-primary">{label}</Badge>
      ))}
      <Badge variant="outline" className="text-muted-foreground">
        {PERSON_DEBTS_LABEL}{!compact && <span className="ml-1 text-[10px]">Siempre</span>}
      </Badge>
    </div>
  )
}
