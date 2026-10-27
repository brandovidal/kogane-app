import type { Person, PersonModule } from './types'

export const PERSON_MODULES = [
  ['fixed_costs', 'Costos fijos'],
  ['platforms', 'Plataformas'],
  ['cards', 'Tarjetas'],
  ['recurring', 'Recurrentes'],
] as const satisfies readonly (readonly [PersonModule, string])[]

export const PERSON_MODULE_KEYS: PersonModule[] = PERSON_MODULES.map(([key]) => key)
export const PERSON_MODULE_LABELS: Record<PersonModule, string> = Object.fromEntries(PERSON_MODULES) as Record<PersonModule, string>
export const PERSON_MODULE_OPTIONS = PERSON_MODULES.map(([value, label]) => ({ value, label }))
export const PERSON_DEBTS_LABEL = 'Cobros y deudas'
export const PEOPLE_TABS = [
  ['all', 'Todas'],
  ['assigned', 'Con asignaciones'],
  ['unassigned', 'Sin asignaciones'],
  ['archived', 'Archivadas'],
] as const
export const PEOPLE_VIEWS = [
  ['checks', 'Checks'],
  ['compact', 'Compacta'],
  ['cards', 'Tarjetas'],
] as const
export const PEOPLE_PAGE_SIZE = 9
export const EMPTY_PEOPLE: Person[] = []
