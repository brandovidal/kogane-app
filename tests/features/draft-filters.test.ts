import { describe, expect, it } from "vitest";

import {
  activeFilterCount,
  EMPTY_DRAFT_FILTERS,
  filterDrafts,
  groupDrafts,
  hasActiveFilters,
  summarizeSelection,
} from "@/features/drafts/lib/draft-filters";

const draft = (over: Record<string, unknown>) => ({
  id: "x",
  description: null,
  rawText: null,
  channel: "web",
  destination: null,
  personId: null,
  missingFields: [] as string[],
  ...over,
});

const items = [
  draft({
    id: "1",
    description: "Almuerzo",
    rawText: "almuerzo 10…",
    destination: "daily",
    personId: "p1",
  }),
  draft({
    id: "2",
    rawText: "captura de Yape",
    channel: "telegram",
    missingFields: ["amount"],
  }),
  draft({ id: "3", description: "Café", destination: "daily", personId: "p2" }),
];

describe("filterDrafts", () => {
  it("sin filtros devuelve todo", () => {
    expect(filterDrafts(items, EMPTY_DRAFT_FILTERS)).toHaveLength(3);
  });
  it("busca sin distinguir tildes ni mayúsculas, también en el texto original", () => {
    expect(
      filterDrafts(items, { ...EMPTY_DRAFT_FILTERS, q: "CAFE" }).map(
        (item) => item.id,
      ),
    ).toEqual(["3"]);
    expect(
      filterDrafts(items, { ...EMPTY_DRAFT_FILTERS, q: "yape" }).map(
        (item) => item.id,
      ),
    ).toEqual(["2"]);
  });
  it("filtra por origen, estado, destino y persona", () => {
    expect(
      filterDrafts(items, { ...EMPTY_DRAFT_FILTERS, origin: "telegram" }),
    ).toHaveLength(1);
    expect(
      filterDrafts(items, { ...EMPTY_DRAFT_FILTERS, state: "incomplete" }),
    ).toHaveLength(1);
    expect(
      filterDrafts(items, { ...EMPTY_DRAFT_FILTERS, destination: "daily" }),
    ).toHaveLength(2);
    expect(
      filterDrafts(items, { ...EMPTY_DRAFT_FILTERS, personId: "p2" }),
    ).toHaveLength(1);
  });
});

describe("filtros activos", () => {
  it("cuenta solo los del popover", () => {
    expect(
      activeFilterCount({
        ...EMPTY_DRAFT_FILTERS,
        state: "ready",
        personId: "p1",
        q: "x",
        origin: "web",
      }),
    ).toBe(2);
  });
  it("hasActiveFilters considera búsqueda y origen", () => {
    expect(hasActiveFilters(EMPTY_DRAFT_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_DRAFT_FILTERS, q: "a" })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_DRAFT_FILTERS, origin: "web" })).toBe(
      true,
    );
  });
});

describe("groupDrafts", () => {
  const labels = { destination: (v: string) => v, person: (id: string) => id };
  it("none devuelve un solo grupo", () => {
    expect(groupDrafts(items, "none", labels)).toHaveLength(1);
  });
  it("agrupa por destino con «Sin destino» y ordena por tamaño", () => {
    const groups = groupDrafts(items, "destination", labels);
    expect(groups.map((group) => [group.label, group.items.length])).toEqual([
      ["daily", 2],
      ["Sin destino", 1],
    ]);
  });
  it("agrupa por origen", () => {
    expect(
      groupDrafts(items, "origin", labels).map((group) => group.label),
    ).toEqual(["Mensajes", "Telegram"]);
  });
});

describe("summarizeSelection", () => {
  it("separa listos de incompletos", () => {
    const summary = summarizeSelection(items, new Set(["1", "2"]));
    expect(summary.count).toBe(2);
    expect(summary.ready.map((item) => item.id)).toEqual(["1"]);
    expect(summary.incomplete).toBe(1);
  });
  it("ignora ids que ya no están en la lista", () => {
    expect(summarizeSelection(items, new Set(["zzz"])).count).toBe(0);
  });
});
