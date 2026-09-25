import { describe, expect, it } from "vitest";

import { historyOf, monthMatches, pageCount } from "@/features/imports/import-view";
import type { ImportBatch, StatementSummary } from "@/shared/api/types";

const batch = (over: Partial<ImportBatch>): ImportBatch =>
  ({ id: "b1", status: "preview", created: 10, updated: 1, unchanged: 5, createdAt: "2026-09-24T10:00:00.000Z", ...over }) as ImportBatch;
const statement = (over: Partial<StatementSummary>): StatementSummary =>
  ({
    id: "s1",
    cardName: "IO",
    paymentMonth: 9,
    paymentYear: 2026,
    status: "review",
    counts: { matched: 3, created: 1, new: 2, ignored: 0 },
    createdAt: "2026-09-24T12:00:00.000Z",
    ...over,
  }) as StatementSummary;

describe("import view", () => {
  it("should join Notion imports and statements, newest first, with what is still pending", () => {
    const history = historyOf([batch({}), batch({ id: "b0", status: "applied", createdAt: "2026-09-01T00:00:00.000Z" })], [statement({})], (m) => `M${m}`);
    expect(history.map((item) => item.key)).toEqual(["statement:s1", "notion:b1", "notion:b0"]);
    expect(history[0]).toMatchObject({ title: "IO · M9 2026", detail: "4 coinciden · 2 nuevos", pending: true });
    expect(history[1]).toMatchObject({ detail: "10 nuevas · 1 cambiaron · 5 iguales", pending: true });
    expect(history[2].pending).toBe(false);
  });

  it("should count pages and check a month against the Notion Resumen", () => {
    expect(pageCount(0, 50)).toBe(1);
    expect(pageCount(3404, 50)).toBe(69);
    expect(monthMatches({ linked: 8412.4, notionSpent: 8412.4 })).toBe(true);
    expect(monthMatches({ linked: 6789.5, notionSpent: 6829.4 })).toBe(false);
    expect(monthMatches({ linked: 0, notionSpent: null })).toBe(false);
  });
});
