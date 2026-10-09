import { draftState } from "./draft-view";

export type DraftOrigin = "all" | "web" | "telegram";
export type DraftStateFilter = "all" | "ready" | "incomplete";
export type DraftGroupBy = "none" | "destination" | "person" | "origin";

export interface DraftFilters {
  q: string;
  origin: DraftOrigin;
  state: DraftStateFilter;
  destination: string | null;
  personId: string | null;
}

export const EMPTY_DRAFT_FILTERS: DraftFilters = {
  q: "",
  origin: "all",
  state: "all",
  destination: null,
  personId: null,
};

export interface FilterableDraft {
  description: string | null;
  rawText: string | null;
  merchant?: string | null;
  channel: string;
  destination?: string | null;
  personId?: string | null;
  missingFields: string[];
}

export const ORIGIN_LABELS: Record<string, string> = {
  web: "Mensajes",
  telegram: "Telegram",
};

export const originLabel = (channel: string) =>
  ORIGIN_LABELS[channel] ?? channel;

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Buscar, Origen y Filtros de la barra de Borrador (boards B1/B2): todo en el navegador, sobre la lista de la pestaña
export function filterDrafts<T extends FilterableDraft>(
  items: T[],
  filters: DraftFilters,
): T[] {
  const query = normalize(filters.q.trim());
  return items.filter((item) => {
    if (filters.origin !== "all" && item.channel !== filters.origin)
      return false;
    if (filters.state !== "all" && draftState(item) !== filters.state)
      return false;
    if (filters.destination && item.destination !== filters.destination)
      return false;
    if (filters.personId && item.personId !== filters.personId) return false;
    if (!query) return true;
    return [item.description, item.rawText, item.merchant].some(
      (text) => text && normalize(text).includes(query),
    );
  });
}

/** Filtros del popover (sin Buscar ni Origen, que tienen su propio control). */
export const activeFilterCount = (filters: DraftFilters) =>
  [filters.state !== "all", filters.destination, filters.personId].filter(
    Boolean,
  ).length;

export const hasActiveFilters = (filters: DraftFilters) =>
  activeFilterCount(filters) > 0 ||
  filters.origin !== "all" ||
  filters.q.trim().length > 0;

export interface DraftGroup<T> {
  key: string;
  label: string;
  items: T[];
}

export function groupDrafts<T extends FilterableDraft>(
  items: T[],
  by: DraftGroupBy,
  labels: {
    destination: (value: string) => string;
    person: (id: string) => string;
  },
): DraftGroup<T>[] {
  if (by === "none") return [{ key: "all", label: "", items }];
  const keyOf = (item: T) =>
    by === "destination"
      ? (item.destination ?? "")
      : by === "person"
        ? (item.personId ?? "")
        : item.channel;
  const labelOf = (key: string) =>
    !key
      ? by === "destination"
        ? "Sin destino"
        : "Sin persona"
      : by === "destination"
        ? labels.destination(key)
        : by === "person"
          ? labels.person(key)
          : originLabel(key);
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()]
    .map(([key, rows]) => ({
      key: key || "none",
      label: labelOf(key),
      items: rows,
    }))
    .sort((a, b) => b.items.length - a.items.length);
}

export interface SelectionSummary<T> {
  count: number;
  ready: T[];
  incomplete: number;
}

// Barra flotante (board B3): cuántos se guardan y cuántos se quedan por estar incompletos
export function summarizeSelection<
  T extends { id: string; missingFields: string[] },
>(items: T[], selected: Set<string>): SelectionSummary<T> {
  const chosen = items.filter((item) => selected.has(item.id));
  const ready = chosen.filter((item) => draftState(item) === "ready");
  return {
    count: chosen.length,
    ready,
    incomplete: chosen.length - ready.length,
  };
}
