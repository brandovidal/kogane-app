import { describe, expect, it } from "vitest";
import {
  dueLabel,
  filterPending,
  groupByPerson,
  groupSection,
  limitList,
  pendingCounts,
  sortByUrgency,
  summarizeSection,
  type PendingEntry,
} from "@/features/dashboard/lib/pending-groups";

const today = new Date(2026, 9, 8);
const entry = (over: Partial<PendingEntry>): PendingEntry => ({
  id: "x",
  kind: "fixed",
  title: "t",
  detail: "d",
  amount: 100,
  dueDate: null,
  href: "/",
  action: "Pagar",
  ...over,
});

const entries: PendingEntry[] = [
  entry({ id: "card", kind: "card", amount: 3561.11, dueDate: "2026-10-12" }),
  entry({ id: "f1", kind: "fixed", amount: 930, dueDate: "2026-10-05" }),
  entry({ id: "f2", kind: "fixed", amount: 120, dueDate: "2026-10-10" }),
  entry({ id: "d", kind: "debt", amount: 200, dueDate: "2026-09-30" }),
  entry({
    id: "c1",
    kind: "collect",
    person: "Danery",
    amount: 50,
    dueDate: "2026-09-12",
  }),
  entry({
    id: "c2",
    kind: "collect",
    person: "Danery",
    amount: 70,
    dueDate: "2026-10-05",
  }),
  entry({
    id: "c3",
    kind: "collect",
    person: "Brenda",
    amount: 40,
    dueDate: "2026-10-30",
  }),
  entry({ id: "r", kind: "review", amount: null }),
  entry({ id: "paid", kind: "card", paid: true, dueDate: "2026-09-01" }),
];

describe("pending groups", () => {
  it("counts all, soon and late without paid items", () => {
    expect(pendingCounts(entries, today)).toEqual({ all: 8, soon: 2, late: 4 });
  });

  it("filters and sorts by urgency", () => {
    const late = sortByUrgency(filterPending(entries, "late", today), today);
    expect(late.map((e) => e.id)).toEqual(["c1", "d", "f1", "c2"]);
    expect(filterPending(entries, "all", today)).toHaveLength(entries.length);
  });

  it("limits a list and reports what is hidden", () => {
    const many = Array.from({ length: 9 }, (_, i) => entry({ id: String(i) }));
    expect(limitList(many, false)).toMatchObject({ hidden: 3 });
    expect(limitList(many, true)).toMatchObject({ hidden: 0 });
  });

  it("groups the pay section by kind, most urgent group first", () => {
    const groups = groupSection(entries, "pay", today);
    expect(groups.map((g) => g.kind)).toEqual(["debt", "fixed", "card"]);
    const fixed = groups.find((g) => g.kind === "fixed")!;
    expect(fixed).toMatchObject({ total: 1050, late: 1, soon: 1 });
    expect(fixed.items.map((e) => e.id)).toEqual(["f1", "f2"]);
  });

  it("summarizes sections", () => {
    expect(summarizeSection(entries, "pay")).toMatchObject({
      count: 4,
      groups: 3,
      total: 3561.11 + 930 + 120 + 200,
    });
    expect(summarizeSection(entries, "collect")).toMatchObject({
      count: 3,
      people: 2,
      total: 160,
    });
    expect(summarizeSection(entries, "review").withoutAmount).toBe(true);
  });

  it("groups collections by person with the oldest date", () => {
    const people = groupByPerson(entries, today);
    expect(people.map((p) => p.person)).toEqual(["Danery", "Brenda"]);
    expect(people[0]).toMatchObject({
      total: 120,
      late: 2,
      oldestDueDate: "2026-09-12",
    });
  });

  it("labels due dates", () => {
    expect(dueLabel("2026-10-12", today)).toBe("vence en 4 d");
    expect(dueLabel("2026-10-05", today)).toBe("retrasado 3 d");
    expect(dueLabel("2026-10-08", today)).toBe("vence hoy");
    expect(dueLabel(null, today)).toBeNull();
  });
});
