import { useMemo } from 'react'
import { PERSON_MODULE_KEYS, PERSON_MODULES } from '../constants'
import type { Person, PersonModule } from '../types'

export function useAssignedSummary(person: Person | null, modules: PersonModule[] = [], isDefault = person?.isDefault ?? false) {
  return useMemo(() => {
    const values = isDefault ? PERSON_MODULE_KEYS : modules
    const labels = values.map((value) => PERSON_MODULES.find(([key]) => key === value)?.[1]).filter(Boolean)
    return labels.length ? `Se usa en ${labels.join(', ')}.` : 'Sin asignaciones'
  }, [isDefault, modules])
}
