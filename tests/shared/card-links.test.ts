import { describe, expect, it } from "vitest";

import { cardFromSearch, cardHref } from "@/shared/lib/card-links";

describe("card links (D102)", () => {
  it("should link a card by its code in the query, and Tarjetas without one", () => {
    expect(cardHref("IO")).toBe("/tarjetas?tarjeta=IO");
    expect(cardHref("Oh Pay")).toBe("/tarjetas?tarjeta=Oh%20Pay");
    expect(cardHref(null)).toBe("/tarjetas");
  });

  it("should read the card back from the address", () => {
    expect(cardFromSearch("?tarjeta=IO")).toBe("IO");
    expect(cardFromSearch("?tarjeta=Oh%20Pay")).toBe("Oh Pay");
    expect(cardFromSearch("")).toBeNull();
    expect(cardFromSearch("?tarjeta=")).toBeNull();
  });
});
