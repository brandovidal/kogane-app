import { describe, expect, it } from "vitest";

import {
  buildPayBody,
  emptyPayAmount,
  emptyPayDetails,
  payAmountError,
} from "@/features/calendar/lib/payment-details";

const card = { refType: "card_statement", refId: "c1" };
const cost = { refType: "fixed_cost", refId: "f1" };

describe("payment details", () => {
  it("sends only the day when nothing else is filled", () => {
    expect(buildPayBody(cost, emptyPayDetails("2026-10-11"), null)).toEqual({
      refType: "fixed_cost",
      refId: "f1",
      paidAt: "2026-10-11",
    });
  });

  it("adds method, account and trimmed note", () => {
    const body = buildPayBody(
      cost,
      {
        paidAt: "2026-10-10",
        method: "wallet",
        accountId: "a1",
        note: "  Yape ",
      },
      null,
    );
    expect(body).toMatchObject({
      method: "wallet",
      accountId: "a1",
      note: "Yape",
    });
  });

  it("takes amount and kind only for a single element, kind only for a card statement", () => {
    const details = emptyPayDetails("2026-10-11");
    expect(
      buildPayBody(card, details, { amount: "150,5", kind: "partial" }),
    ).toMatchObject({ amount: 150.5, kind: "partial" });
    expect(
      buildPayBody(cost, details, { amount: "80", kind: "partial" }),
    ).toEqual(expect.objectContaining({ amount: 80 }));
    expect(
      buildPayBody(cost, details, { amount: "80", kind: "partial" }),
    ).not.toHaveProperty("kind");
    expect(
      buildPayBody(card, details, { ...emptyPayAmount() }),
    ).not.toHaveProperty("kind");
  });

  it("asks for an amount on a partial card payment and rejects non positive ones", () => {
    expect(payAmountError(card, { amount: "", kind: "partial" })).toMatch(
      /cuánto/,
    );
    expect(payAmountError(card, { amount: "0", kind: "total" })).toMatch(
      /mayor/,
    );
    expect(payAmountError(card, { amount: "", kind: "minimum" })).toBeNull();
    expect(payAmountError(cost, { amount: "", kind: "total" })).toBeNull();
    expect(payAmountError(cost, null)).toBeNull();
  });
});
