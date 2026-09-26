import { describe, expect, it } from "vitest";

import type { Commitment } from "@/shared/api/types";

import { currentLabel, percentPaid, totalsOf } from "@/features/commitments/commitment-view";

const progress = (overrides: Partial<NonNullable<Commitment["progress"]>> = {}) => ({
  installmentCount: 36,
  createdCount: 36,
  paidCount: 12,
  remainingCount: 24,
  currentInstallment: 13,
  paidAmount: 23409.12,
  pendingAmount: 46818.24,
  lateCount: 0,
  nextDueDate: "2026-10-05",
  ...overrides,
});

const commitment = (overrides: Partial<Commitment> = {}) =>
  ({ id: "c1", status: "active", installmentCount: 36, contributedAmount: 0, progress: progress(), ...overrides }) as Commitment;

describe("commitment-view", () => {
  it("should say which installment is the current one", () => {
    expect(currentLabel(commitment())).toBe("Cuota 13/36");
    expect(currentLabel(commitment({ progress: progress({ currentInstallment: 0 }) }))).toBe("Aún no empieza");
    expect(currentLabel(commitment({ progress: null }))).toBeNull();
  });

  it("should give the percentage of installments paid", () => {
    expect(percentPaid(commitment())).toBe(33);
    expect(percentPaid(commitment({ progress: null }))).toBe(0);
  });

  it("should add up only the active commitments", () => {
    const totals = totalsOf([
      commitment(),
      commitment({ id: "c2", progress: progress({ paidAmount: 100, pendingAmount: 50, lateCount: 2 }) }),
      commitment({ id: "c3", status: "cancelled" }),
      commitment({ id: "c4", progress: null, installmentCount: null, contributedAmount: 350.5 }),
    ]);

    expect(totals).toEqual({ paid: 23509.12, pending: 46868.24, contributed: 350.5, late: 2 });
  });
});
