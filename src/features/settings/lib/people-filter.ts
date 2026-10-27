// Compatibility exports for existing consumers; the implementation now lives with the people feature.
export { filterPeople, isPersonAssigned as isAssigned, togglePersonModule as toggleModule } from '../components/people/lib'
export type { Person, PeopleTab } from '../components/people/types'
