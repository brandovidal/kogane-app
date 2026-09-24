import { describe, expect, it } from "vitest";

import { eventLabel, eventsByDay, gridRange, isPayable, monthGrid } from "@/features/calendar/calendar-view";
import type { CalendarEvent } from "@/shared/api/types";

const event = (overrides: Partial<CalendarEvent>): CalendarEvent => ({
  date: "2026-10-12",
  kind: "card_due",
  name: "IO",
  personName: null,
  installment: null,
  amount: 389.71,
  currency: "PEN",
  status: "pending",
  refType: "card_statement",
  refId: "io@2026-09",
  color: null,
  ...overrides,
});

describe("calendar view (P20)", () => {
  it("should cover the month with whole weeks from Monday", () => {
    // September 2026 starts on a Tuesday and ends on a Wednesday
    const weeks = monthGrid(9, 2026);

    expect(weeks).toHaveLength(5);
    expect(weeks[0][0]).toEqual({ date: "2026-08-31", day: 31, inMonth: false });
    expect(weeks[0][1]).toEqual({ date: "2026-09-01", day: 1, inMonth: true });
    expect(weeks[4][6]).toEqual({ date: "2026-10-04", day: 4, inMonth: false });
    expect(gridRange(9, 2026)).toEqual({ from: "2026-08-31", to: "2026-10-04" });
  });

  it("should fit February of a year that starts on Monday in four weeks", () => {
    expect(monthGrid(2, 2027)).toHaveLength(4);
  });

  it("should group the events by day", () => {
    const byDay = eventsByDay([event({}), event({ kind: "card_close" }), event({ date: "2026-10-13" })]);

    expect([...byDay.keys()]).toEqual(["2026-10-12", "2026-10-13"]);
    expect(byDay.get("2026-10-12")).toHaveLength(2);
  });

  it("should name each event and offer Pagado only on what is unpaid and payable", () => {
    expect(eventLabel(event({}))).toBe("Pago IO");
    expect(eventLabel(event({ kind: "card_close" }))).toBe("Cierre IO");
    expect(eventLabel(event({ kind: "debt_i_owe", name: "Préstamo", installment: "2/5", personName: "Danery" }))).toBe(
      "Préstamo 2/5 · Danery",
    );

    expect(isPayable(event({}))).toBe(true);
    expect(isPayable(event({ status: "paid" }))).toBe(false);
    expect(isPayable(event({ kind: "card_close" }))).toBe(false);
    expect(isPayable(event({ kind: "recurring", refType: null }))).toBe(false);
  });
});
