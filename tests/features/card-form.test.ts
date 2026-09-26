import { describe, expect, it } from "vitest";

import { cardBody, cardErrors, emptyCardForm } from "@/features/settings/card-form";

describe("new card form (D97)", () => {
  it("should ask a credit card for its name, code and both days, and a debit card for its bank", () => {
    expect(Object.keys(cardErrors(emptyCardForm()))).toEqual(["name", "code", "billingCloseDay", "paymentDueDay"]);
    expect(Object.keys(cardErrors({ ...emptyCardForm(), type: "debit_card", name: "Scotia" }))).toEqual(["bank"]);
  });

  it("should refuse days outside 1–31 and accept a complete card", () => {
    const credit = { ...emptyCardForm(), name: "Ripley", code: "rip", billingCloseDay: "25", paymentDueDay: "12" };

    expect(cardErrors(credit)).toEqual({});
    expect(cardErrors({ ...credit, billingCloseDay: "32" }).billingCloseDay).toBeDefined();
    expect(cardErrors({ ...credit, paymentDueDay: "0" }).paymentDueDay).toBeDefined();
  });

  it("should send only what its type uses, with the code in capitals", () => {
    const credit = { ...emptyCardForm(), name: " Ripley ", code: "rip", billingCloseDay: "25", paymentDueDay: "12" };

    expect(cardBody(credit)).toEqual({
      name: "Ripley",
      type: "credit_card",
      aliases: ["ripley"],
      code: "RIP",
      billingCloseDay: 25,
      paymentDueDay: 12,
    });
    expect(cardBody({ ...emptyCardForm(), type: "debit_card", name: "Scotia", bank: "Scotiabank" })).toEqual({
      name: "Scotia",
      type: "debit_card",
      aliases: ["scotia"],
      bank: "Scotiabank",
    });
  });
});
