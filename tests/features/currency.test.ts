import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  convertToPEN,
  calculateAmountInPEN,
} from "@/shared/lib/currency";

describe("currency", () => {
  it("formats PEN correctly", () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain("1");
    expect(result).toContain("234");
  });

  it("formats USD correctly", () => {
    const result = formatCurrency(25.0, "USD");
    expect(result).toContain("25");
  });

  it("converts USD to PEN", () => {
    expect(convertToPEN(25, 3.72)).toBe(93);
  });

  it("returns PEN amount as-is", () => {
    expect(calculateAmountInPEN(100, "PEN")).toBe(100);
  });

  it("converts non-PEN with exchange rate", () => {
    expect(calculateAmountInPEN(25, "USD", 3.72)).toBe(93);
  });

  it("throws without exchange rate for USD", () => {
    expect(() => calculateAmountInPEN(25, "USD")).toThrow();
  });
});
