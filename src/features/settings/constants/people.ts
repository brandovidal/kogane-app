// Pages where a person can be picked (Configuración ▸ Personas). Día a día is always the user and Cobros y deudas lists
// everyone, so neither is a module; the owner ("Yo") appears in all of them (kogane-api: Person.appearsIn)
export const PERSON_MODULES = [
  ["fixed_costs", "Costos fijos"],
  ["platforms", "Plataformas"],
  ["cards", "Tarjetas"],
  ["recurring", "Recurrentes"],
] as const;

export type PersonModule = (typeof PERSON_MODULES)[number][0];

export const PERSON_MODULE_LABELS: Record<PersonModule, string> = Object.fromEntries(PERSON_MODULES) as Record<PersonModule, string>;

export const PERSON_MODULE_KEYS: PersonModule[] = PERSON_MODULES.map(([key]) => key);
