import { describe, expect, it } from "vitest";

import { toDraftBody } from "@/features/drafts/draft-form";
import { paidAndOwn, shareParts, totalsOf } from "@/shared/lib/shared-expense";

describe("shared expenses (D73)", () => {
  it("should split the total like kogane-api: ratios, amounts and the rest for the user", () => {
    expect(
      shareParts(65, [
        { personId: "brenda", ratio: 0.3 },
        { personId: "danery", amount: 20 },
      ]),
    ).toEqual({
      parts: [
        { personId: "brenda", amount: 19.5, percent: 30 },
        { personId: "danery", amount: 20, percent: 31 },
      ],
      own: 25.5,
    });
  });

  it("should give what was paid and the user's part of a row, also in dollars", () => {
    expect(paidAndOwn({ amount: 64, amountInPen: null, othersShare: 32 })).toEqual({ paid: 64, own: 32 });
    expect(paidAndOwn({ amount: 10, amountInPen: 37.5, othersShare: 5 })).toEqual({ paid: 37.5, own: 18.75 });
    expect(totalsOf([{ amount: 64, othersShare: 32 }, { amount: 20 }])).toEqual({ paid: 84, own: 52 });
  });

  it("should send the split of a draft without empty rows, and never for debts", () => {
    const sharedWith = { shares: [{ personId: "danery", ratio: 0.5 }, { personId: "", ratio: 0.5 }] };

    expect(toDraftBody({ destination: "subscription", sharedWith }).sharedWith).toEqual({
      shares: [{ personId: "danery", ratio: 0.5 }],
    });
    expect(toDraftBody({ destination: "receivable", sharedWith }).sharedWith).toBeNull();
    expect(toDraftBody({ destination: "daily", sharedWith: { shares: [] } }).sharedWith).toBeNull();
  });
});
