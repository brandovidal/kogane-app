import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

// Whose expenses the lists show (D71, D78): "me" (the default person), "all", or one person's id.
// The budget and the Resumen are always yours; this only filters Día a día, Costos fijos, Plataformas and Tarjetas.
export const PERSON_ME = "me";
export const PERSON_ALL = "all";

const STORAGE_KEY = "kogane:person";

interface PersonState {
  person: string;
  setPerson: (person: string) => void;
}

// A convenience of this browser only: without storage (private window) it starts on "me"
function readStored(): string {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) ?? PERSON_ME;
  } catch {
    return PERSON_ME;
  }
}

export const personStore = createStore<PersonState>()((set) => ({
  person: readStored(),
  setPerson: (person) => {
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, person);
    } catch {
      // not remembered, still applied
    }
    set({ person });
  },
}));

export const usePersonFilter = <T,>(selector: (state: PersonState) => T) => useStore(personStore, selector);

// The personId for /v1/expenses: undefined for everyone, the default person for "me"
export function resolvePersonId(person: string, defaultPersonId: string | undefined): string | undefined {
  if (person === PERSON_ALL) return undefined;
  if (person === PERSON_ME) return defaultPersonId;
  return person;
}
