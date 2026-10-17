import { describe, expect, it } from "vitest";
import {
  accountBody,
  accountErrors,
  emptyAccountForm,
} from "@/features/settings/lib/account-form";

describe("account form", () => {
  it("asks for a name and, on a bank account, its bank", () => {
    expect(Object.keys(accountErrors(emptyAccountForm()))).toEqual([
      "name",
      "bank",
    ]);
  });

  it("a wallet or cash only needs a name", () => {
    const form = {
      ...emptyAccountForm(),
      name: "Yape",
      type: "wallet" as const,
    };
    expect(accountErrors(form)).toEqual({});
    expect(accountBody(form).bank).toBeNull();
  });

  it("trims the body and drops an empty color", () => {
    const body = accountBody({
      ...emptyAccountForm(),
      name: " Sueldo ",
      bank: " BCP ",
    });
    expect(body).toMatchObject({
      name: "Sueldo",
      bank: "BCP",
      currency: "PEN",
      color: null,
    });
  });
});
