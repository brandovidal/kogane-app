import { describe, expect, it } from "vitest";

import type { FixedCost } from "@/shared/api/types";
import { previousMonthBody } from "@/features/expenses/lib/expense-actions";
import {
  filterByMonthRange,
  installmentSeries,
  monthGroupKey,
  monthGroupLabel,
  monthRangeLabel,
  parseInstallment,
  payableByUrgency,
  relativeDueLabel,
  urgencyOf,
} from "@/features/fixed-costs/lib/fixed-cost-views";

const cost = (overrides: Partial<FixedCost>): FixedCost =>
  ({
    id: "id",
    description: "Terreno",
    amount: 1042,
    amountInPen: 1042,
    currency: "PEN",
    paymentStatus: "not_started",
    paymentMonth: 10,
    paymentYear: 2026,
    dueDate: "2026-10-06",
    installment: null,
    personId: "brando",
    ...overrides,
  }) as FixedCost;

describe("fixed cost views", () => {
  it("should read installments and ignore single payments", () => {
    expect(parseInstallment("17/48")).toEqual({
      current: 17,
      total: 48,
      percent: 35,
    });
    expect(parseInstallment("1/1")).toBeNull();
    expect(parseInstallment("50/48")).toBeNull();
    expect(parseInstallment(null)).toBeNull();
  });

  it("should keep the months of a range, inclusive", () => {
    const records = [
      cost({ id: "jul", paymentMonth: 7 }),
      cost({ id: "aug", paymentMonth: 8 }),
      cost({ id: "oct", paymentMonth: 10 }),
      cost({ id: "jan", paymentMonth: 1, paymentYear: 2027 }),
    ];
    expect(
      filterByMonthRange(records, "2026-08", "2026-10").map((item) => item.id),
    ).toEqual(["aug", "oct"]);
    expect(
      filterByMonthRange(records, "2026-10").map((item) => item.id),
    ).toEqual(["oct", "jan"]);
    expect(monthRangeLabel("2026-08", "2026-10")).toBe("Ago – Oct 2026");
  });

  it("should group pending costs by urgency, overdue first", () => {
    const today = "2026-10-02";
    const records = [
      cost({ id: "later", dueDate: "2026-12-20" }),
      cost({ id: "week", dueDate: "2026-10-05" }),
      cost({ id: "paid", dueDate: "2026-10-03", paymentStatus: "paid" }),
      cost({ id: "late", dueDate: "2026-09-30" }),
      cost({ id: "none", dueDate: null }),
    ];
    expect(urgencyOf(records[1], today)).toBe("week");
    expect(payableByUrgency(records, today).map((item) => item.id)).toEqual([
      "late",
      "week",
      "later",
      "none",
    ]);
  });

  it("should keep the latest month of each installment series and estimate what is left", () => {
    const [series] = installmentSeries([
      cost({
        id: "sep",
        paymentMonth: 9,
        installment: "16/48",
        paymentStatus: "paid",
      }),
      cost({ id: "oct", paymentMonth: 10, installment: "17/48" }),
    ]);
    expect(series.latest.id).toBe("oct");
    expect(series.paid).toBe(16);
    expect(series.remaining).toBe(32);
    expect(series.estimatedBalance).toBe(33344);
    expect(
      monthGroupLabel(
        monthGroupKey(cost({ paymentMonth: 5, paymentYear: 2029 })),
      ),
    ).toBe("Mayo 2029");
    // Cuota 17 en octubre 2026 → la 48 cae 31 meses después: mayo 2029
    expect(series.endIndex).toBe(2029 * 12 + 4);
  });

  it("should describe the days left and move a record to the previous month", () => {
    expect(relativeDueLabel(3)).toBe("en 3 días");
    expect(relativeDueLabel(0)).toBe("vence hoy");
    expect(relativeDueLabel(-1)).toBe("venció hace 1 día");
    expect(previousMonthBody({ paymentMonth: 1, paymentYear: 2026 })).toEqual({
      paymentMonth: 12,
      paymentYear: 2025,
    });
  });
});
