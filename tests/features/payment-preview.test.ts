import { describe, expect, it } from "vitest";
import { previewPayment } from "@/features/debts/lib/payment-preview";

describe("previewPayment", () => {
  it("partial payment leaves the difference and is in progress", () => {
    expect(previewPayment(74.57, 40)).toEqual({
      current: 74.57,
      applied: 40,
      after: 34.57,
      outcome: "in_progress",
    });
  });

  it("full payment settles the debt", () => {
    const preview = previewPayment(200, 200);
    expect(preview.after).toBe(0);
    expect(preview.outcome).toBe("paid");
  });

  it("never applies more than the balance", () => {
    const preview = previewPayment(50, 80);
    expect(preview.applied).toBe(50);
    expect(preview.after).toBe(0);
  });

  it("an empty or invalid amount changes nothing", () => {
    expect(previewPayment(50, Number.NaN).outcome).toBe("pending");
    expect(previewPayment(50, 0).after).toBe(50);
  });
});
