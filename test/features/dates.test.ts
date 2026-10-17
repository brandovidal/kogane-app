import { describe, it, expect } from "vitest";
import { getMonthName, formatDate } from "@/shared/lib/dates";

describe("dates", () => {
  it("returns correct month name", () => {
    expect(getMonthName(1)).toBe("Enero");
    expect(getMonthName(3)).toBe("Marzo");
    expect(getMonthName(12)).toBe("Diciembre");
  });

  it("formats date in es-PE locale", () => {
    const result = formatDate("2026-03-15T12:00:00");
    expect(result).toContain("15");
    expect(result).toContain("03");
    expect(result).toContain("2026");
  });
});
