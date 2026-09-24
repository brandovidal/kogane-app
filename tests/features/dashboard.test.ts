import { describe, expect, it } from "vitest";

import { buildCreditCardSummaries } from "@/features/dashboard/dashboard.service";
import type { CreditCardExpense, PaymentMethod } from "@/shared/api/types";

describe("dashboard", () => {
  it("should total each card with its expenses of the month", () => {
    const cards = [
      { id: "io", code: "IO", name: "IO", color: null, billingCloseDay: 25, paymentDueDay: 12 },
      { id: "new", code: null, name: "Nueva", color: "#123", billingCloseDay: null, paymentDueDay: null },
    ] as PaymentMethod[];
    const expenses = [
      { paymentMethodId: "io", amount: 100, amountInPen: 100 },
      { paymentMethodId: "io", amount: 20, amountInPen: 75 },
    ] as CreditCardExpense[];

    expect(buildCreditCardSummaries(cards, expenses)).toEqual([
      { code: "IO", name: "IO", color: null, billingCloseDay: 25, paymentDueDay: 12, total: 175 },
      { code: "Nueva", name: "Nueva", color: "#123", billingCloseDay: 0, paymentDueDay: 0, total: 0 },
    ]);
  });
});
