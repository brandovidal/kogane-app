import { describe, expect, it } from "vitest";
import { dayKey, dayLabel } from "@/features/daily/lib/day-label";

const today = new Date(2026, 9, 6, 15, 0); // 6 oct 2026, local

describe("dayLabel", () => {
  it("says Hoy and Ayer", () => {
    expect(dayLabel("2026-10-06", today)).toBe("Hoy · mar 6 oct");
    expect(dayLabel("2026-10-05", today)).toBe("Ayer · lun 5 oct");
  });

  it("capitalises older days", () => {
    expect(dayLabel("2026-10-03", today)).toBe("Sáb 3 oct");
  });

  it("ignores the time part and a missing today", () => {
    expect(dayLabel("2026-10-03T14:20:00Z")).toBe("Sáb 3 oct");
    expect(dayLabel("2026-10-06")).toBe("Mar 6 oct");
  });

  it("keys by calendar day", () => {
    expect(dayKey("2026-10-03T14:20:00Z")).toBe("2026-10-03");
  });
});
