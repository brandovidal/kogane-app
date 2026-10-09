import { describe, expect, it } from "vitest";
import {
  isPeriodPresetActive,
  resolvePeriodPreset,
} from "@/shared/lib/period-presets";

const now = new Date(2026, 9, 9);

describe("period presets", () => {
  it("resuelve este mes, mes pasado y este año", () => {
    expect(resolvePeriodPreset("this-month", now)).toEqual({
      month: "10",
      year: "2026",
    });
    expect(resolvePeriodPreset("last-month", now)).toEqual({
      month: "9",
      year: "2026",
    });
    expect(resolvePeriodPreset("this-year", now)).toEqual({
      month: undefined,
      year: "2026",
    });
  });

  it("mes pasado en enero cruza al año anterior", () => {
    expect(resolvePeriodPreset("last-month", new Date(2026, 0, 5))).toEqual({
      month: "12",
      year: "2025",
    });
  });

  it("detecta el atajo activo", () => {
    expect(isPeriodPresetActive("this-month", "10", "2026", now)).toBe(true);
    expect(isPeriodPresetActive("this-month", "9", "2026", now)).toBe(false);
    expect(isPeriodPresetActive("this-year", undefined, "2026", now)).toBe(
      true,
    );
  });
});
