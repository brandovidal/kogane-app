import { describe, expect, it } from "vitest";
import { addToTotals, buildMonthGrid } from "@/features/daily/lib/month-grid";

const expense = (
  id: string,
  spentAt: string,
  amount: number,
  currency = "PEN",
) => ({
  id,
  spentAt,
  amount,
  currency,
});

describe("buildMonthGrid", () => {
  it("starts on Monday and pads with the neighbouring months (oct 2026)", () => {
    const weeks = buildMonthGrid(2026, 10, []);
    // 1 Oct 2026 is a Thursday → 3 leading days (28, 29, 30 Sep)
    expect(weeks[0].map((cell) => cell.day)).toEqual([
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
    ]);
    expect(weeks[0][0].inMonth).toBe(false);
    expect(weeks[0][3].inMonth).toBe(true);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks).toHaveLength(5);
  });

  it("adds a week when the month needs six rows", () => {
    // Aug 2026 starts on Saturday and has 31 days → 6 weeks
    expect(buildMonthGrid(2026, 8, [])).toHaveLength(6);
  });

  it("groups expenses by day with totals per currency", () => {
    const weeks = buildMonthGrid(2026, 10, [
      expense("a", "2026-10-02", 12),
      expense("b", "2026-10-02T15:00:00Z", 24.6),
      expense("c", "2026-10-01", 24.99, "USD"),
    ]);
    const cells = weeks.flat();
    const second = cells.find((cell) => cell.day === "2026-10-02");
    expect(second?.expenses).toHaveLength(2);
    expect(second?.totals.PEN).toBeCloseTo(36.6);
    expect(cells.find((cell) => cell.day === "2026-10-01")?.totals).toEqual({
      USD: 24.99,
    });
  });
});

describe("addToTotals", () => {
  it("counts anything but USD as soles", () => {
    expect(addToTotals({}, 5, null)).toEqual({ PEN: 5 });
    expect(addToTotals({ PEN: 5 }, 3, "PEN")).toEqual({ PEN: 8 });
  });
});
