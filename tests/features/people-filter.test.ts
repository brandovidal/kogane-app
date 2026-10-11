import { describe, expect, it } from "vitest";

import {
  filterPeople,
  isAssigned,
  toggleModule,
  type Person,
} from "@/features/settings/lib/people-filter";
import {
  SETTINGS_NAV_GROUPS,
  settingsHref,
} from "@/features/settings/constants/sections";

const person = (over: Partial<Person>): Person =>
  ({
    id: "p",
    name: "Persona",
    aliases: [],
    isDefault: false,
    isActive: true,
    appearsIn: [],
    ...over,
  }) as Person;

const people = [
  person({ id: "1", name: "Brando", isDefault: true }),
  person({ id: "2", name: "Danery", aliases: ["dany"], appearsIn: ["cards"] }),
  person({ id: "3", name: "Mamá", appearsIn: [] }),
  person({ id: "4", name: "Luis", isActive: false, appearsIn: ["platforms"] }),
];
const names = (list: Person[]) => list.map((p) => p.name);

describe("people filter", () => {
  it("counts the owner as assigned everywhere", () => {
    expect(isAssigned(people[0])).toBe(true);
    expect(isAssigned(people[2])).toBe(false);
  });

  it("splits tabs and keeps archived apart", () => {
    const base = { query: "", module: null } as const;
    expect(names(filterPeople(people, { ...base, tab: "all" }))).toEqual([
      "Brando",
      "Danery",
      "Mamá",
    ]);
    expect(names(filterPeople(people, { ...base, tab: "assigned" }))).toEqual([
      "Brando",
      "Danery",
    ]);
    expect(names(filterPeople(people, { ...base, tab: "unassigned" }))).toEqual(
      ["Mamá"],
    );
    expect(names(filterPeople(people, { ...base, tab: "archived" }))).toEqual([
      "Luis",
    ]);
  });

  it("filters by page keeping the owner, and searches names and aliases without accents", () => {
    expect(
      names(filterPeople(people, { tab: "all", query: "", module: "cards" })),
    ).toEqual(["Brando", "Danery"]);
    expect(
      names(filterPeople(people, { tab: "all", query: "DANY", module: null })),
    ).toEqual(["Danery"]);
    expect(
      names(filterPeople(people, { tab: "all", query: "mama", module: null })),
    ).toEqual(["Mamá"]);
  });

  it("toggles a module without mutating", () => {
    const current = ["cards"] as const;
    expect(toggleModule([...current], "recurring")).toEqual([
      "cards",
      "recurring",
    ]);
    expect(toggleModule([...current], "cards")).toEqual([]);
    expect(current).toEqual(["cards"]);
  });
});

describe("settings sections", () => {
  it("gives every section its own route and marks only Usuarios as admin", () => {
    const items = SETTINGS_NAV_GROUPS.flatMap((g) => g.items);
    expect(items.map((i) => settingsHref(i.key))).toContain(
      "/configuracion/personas",
    );
    expect(items.filter((i) => i.adminOnly).map((i) => i.key)).toEqual([
      "usuarios",
    ]);
    expect(new Set(items.map((i) => i.key)).size).toBe(items.length);
  });
});
