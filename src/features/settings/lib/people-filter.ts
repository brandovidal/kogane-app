import type { Schemas } from "@/shared/api/client";
import { normalize } from "@/shared/lib/text";
import type { PersonModule } from "../constants";

export type Person = Schemas["PersonResponseDto"]["data"];
export type PeopleTab = "all" | "assigned" | "unassigned" | "archived";

export const PEOPLE_TABS: [PeopleTab, string][] = [
  ["all", "Todas"],
  ["assigned", "Con asignaciones"],
  ["unassigned", "Sin asignaciones"],
  ["archived", "Archivadas"],
];

// "Yo" is always in every page, so it counts as assigned
export const isAssigned = (person: Person) => person.isDefault || (person.appearsIn?.length ?? 0) > 0;

export function filterPeople(people: Person[], options: { tab: PeopleTab; query: string; module: PersonModule | null }): Person[] {
  const query = normalize(options.query.trim());
  return people.filter((person) => {
    if (options.tab === "archived") {
      if (person.isActive) return false;
    } else if (!person.isActive) return false;
    if (options.tab === "assigned" && !isAssigned(person)) return false;
    if (options.tab === "unassigned" && isAssigned(person)) return false;
    if (options.module && !person.isDefault) {
      if (!person.appearsIn?.includes(options.module)) return false;
    }
    if (!query) return true;
    return [person.name, ...person.aliases].some((text) => normalize(text).includes(query));
  });
}

export function toggleModule(current: PersonModule[], module: PersonModule): PersonModule[] {
  return current.includes(module) ? current.filter((key) => key !== module) : [...current, module];
}
