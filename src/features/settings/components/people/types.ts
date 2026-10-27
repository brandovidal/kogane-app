import type { Schemas } from '@/shared/api/client'

export type Person = Schemas['PersonResponseDto']['data']
export type PersonModule = 'fixed_costs' | 'platforms' | 'cards' | 'recurring'
export type PeopleTab = 'all' | 'assigned' | 'unassigned' | 'archived'
export type PeopleView = 'checks' | 'compact' | 'cards'

export interface PersonIdentityProps {
  person: Person
  showAlias?: boolean
  showDocument?: boolean
}

export interface PersonModulesProps {
  person: Person
  compact?: boolean
}

export interface PersonModuleAssignmentsProps {
  person: Person
  disabled?: boolean
  onChange: (modules: PersonModule[]) => void
}
