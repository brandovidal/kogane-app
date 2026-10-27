import { normalize } from '@/shared/lib/text'
import type { PeopleTab, Person, PersonModule } from './types'

export const isPersonAssigned = (person: Person) => person.isDefault || (person.appearsIn?.length ?? 0) > 0

export function filterPeople(people: Person[], options: { tab: PeopleTab; query: string; module: PersonModule | null }): Person[] {
  const query = normalize(options.query.trim())
  return people.filter((person) => {
    if (options.tab === 'archived') {
      if (person.isActive) return false
    } else if (!person.isActive) return false
    if (options.tab === 'assigned' && !isPersonAssigned(person)) return false
    if (options.tab === 'unassigned' && isPersonAssigned(person)) return false
    if (options.module && !person.isDefault && !person.appearsIn?.includes(options.module)) return false
    return !query || [person.name, ...person.aliases].some((text) => normalize(text).includes(query))
  })
}

export function togglePersonModule(current: PersonModule[], module: PersonModule): PersonModule[] {
  return current.includes(module) ? current.filter((key) => key !== module) : [...current, module]
}
