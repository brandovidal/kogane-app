import { createStore } from "zustand/vanilla";
import {
  DATA_TABLE_CALCULATIONS,
  type DataTableCalculation,
  type DataTableCalculationSelection,
} from "@/shared/types/data-table-calculation";

const STORAGE_KEY = "kogane:data-table-calculations";
const LEGACY_STORAGE_PREFIX = "kogane:table-calculations:";

type TableSelections = Record<string, DataTableCalculationSelection>;

interface DataTableCalculationsState {
  selections: TableSelections;
  hydrated: Record<string, true>;
  initializeTable: (
    tableKey: string,
    defaults: DataTableCalculationSelection,
  ) => void;
  setCalculation: (
    tableKey: string,
    columnId: string,
    calculation: DataTableCalculation,
  ) => void;
}

function isCalculation(value: unknown): value is DataTableCalculation {
  return DATA_TABLE_CALCULATIONS.includes(value as DataTableCalculation);
}

function parseSelection(value: unknown): DataTableCalculationSelection {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, DataTableCalculation] =>
        isCalculation(entry[1]),
    ),
  );
}

function readStoredSelections(): TableSelections {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([tableKey, selection]) => [
        tableKey,
        parseSelection(selection),
      ]),
    );
  } catch {
    return {};
  }
}

function persistSelections(selections: TableSelections): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
    return true;
  } catch {
    // Keep the in-memory selection available for this session if storage is unavailable.
    return false;
  }
}

export const dataTableCalculationsStore =
  createStore<DataTableCalculationsState>()((set, get) => ({
    selections: {},
    hydrated: {},
    initializeTable: (tableKey, defaults) => {
      if (get().hydrated[tableKey]) return;

      const selections = readStoredSelections();
      let savedSelection: DataTableCalculationSelection | undefined =
        selections[tableKey];
      let migratedLegacyKey: string | undefined;
      if (!savedSelection && typeof window !== "undefined") {
        try {
          migratedLegacyKey = `${LEGACY_STORAGE_PREFIX}${tableKey}`;
          const legacyRaw = window.localStorage.getItem(migratedLegacyKey);
          if (legacyRaw) {
            savedSelection = parseSelection(JSON.parse(legacyRaw));
          } else {
            migratedLegacyKey = undefined;
          }
        } catch {
          savedSelection = undefined;
          migratedLegacyKey = undefined;
        }
      }

      const nextSelections = {
        ...get().selections,
        ...selections,
        [tableKey]: {
          ...defaults,
          ...get().selections[tableKey],
          ...savedSelection,
        },
      };
      set((state) => ({
        selections: nextSelections,
        hydrated: { ...state.hydrated, [tableKey]: true },
      }));
      if (persistSelections(nextSelections) && migratedLegacyKey) {
        try {
          window.localStorage.removeItem(migratedLegacyKey);
        } catch {
          // Keeping the legacy key is safe; it will be replaced after a future successful migration.
        }
      }
    },
    setCalculation: (tableKey, columnId, calculation) => {
      const nextSelections = {
        ...get().selections,
        [tableKey]: {
          ...(get().selections[tableKey] ?? {}),
          [columnId]: calculation,
        },
      };
      set({ selections: nextSelections });
      persistSelections(nextSelections);
    },
  }));
