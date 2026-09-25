import { describe, expect, it } from "vitest";

import { duplicateBody, isPaidStatus, nextMonthBody } from "@/shared/lib/expense-actions";

describe("row actions of the expense tables", () => {
  it("should copy only the columns of the table, with days as YYYY-MM-DD and no ids, totals or chat draft", () => {
    const body = duplicateBody("daily-expenses", {
      id: "e1",
      description: "Uber",
      amount: 20,
      currency: "PEN",
      amountInPen: 20,
      othersShare: 10,
      personId: "me",
      paymentMethodId: "cash",
      categoryId: null,
      spentAt: "2026-09-22T00:00:00.000Z",
      draftId: "d1",
      createdAt: "2026-09-22T10:00:00.000Z",
    });

    expect(body).toEqual({
      description: "Uber (copia)",
      amount: 20,
      currency: "PEN",
      personId: "me",
      paymentMethodId: "cash",
      spentAt: "2026-09-22",
    });
  });

  it("should keep the payment month of a card charge and start the copy as \"No iniciado\"", () => {
    const body = duplicateBody("credit-card-expenses", {
      description: "Falabella",
      amount: 50,
      paymentStatus: "paid",
      paymentMonth: 12,
      paymentYear: 2026,
      installment: "2/6",
      processDate: null,
      originDraftId: "d2",
    });

    expect(body).toEqual({
      description: "Falabella (copia)",
      amount: 50,
      paymentMonth: 12,
      paymentYear: 2026,
      installment: "2/6",
      paymentStatus: "not_started",
    });
  });

  it("should move to the next payment month across the year", () => {
    expect(nextMonthBody({ paymentMonth: 12, paymentYear: 2026 })).toEqual({ paymentMonth: 1, paymentYear: 2027 });
    expect(nextMonthBody({ paymentMonth: 9, paymentYear: 2026 })).toEqual({ paymentMonth: 10, paymentYear: 2026 });
  });

  it("should only offer Pagado while it is not paid", () => {
    expect(isPaidStatus("pending")).toBe(false);
    expect(isPaidStatus("paid")).toBe(true);
    expect(isPaidStatus("waived")).toBe(true);
  });
});
