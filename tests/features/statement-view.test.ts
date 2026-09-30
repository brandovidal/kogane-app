import { describe, expect, it } from "vitest";


import { totalsOf } from "@/features/statements/lib/statement-view";

describe("totalsOf", () => {
  it("should add soles and dollars apart, to the cent", () => {
    expect(
      totalsOf([
        { amount: 0.1, currency: "PEN" },
        { amount: 0.2, currency: "PEN" },
        { amount: 25, currency: "USD" },
        { amount: -5, currency: "USD" },
      ]),
    ).toEqual([
      { currency: "PEN", amount: 0.3 },
      { currency: "USD", amount: 20 },
    ]);
  });

  it("should return only the currencies that have movements", () => {
    expect(totalsOf([{ amount: 12.5 }])).toEqual([{ currency: "PEN", amount: 12.5 }]);
    expect(totalsOf([])).toEqual([]);
  });
});
