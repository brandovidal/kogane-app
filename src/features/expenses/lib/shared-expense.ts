// Shared expenses (D73): a row keeps the total the user paid and othersShare, what other people owe of it

interface PaidRecord {
  amount: number;
  amountInPen?: number | null;
  othersShare?: number | null;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

// What the row cost in soles (the charge) and the user's part of it; othersShare is in the row's currency
export function paidAndOwn({ amount, amountInPen, othersShare }: PaidRecord) {
  const paid = amountInPen ?? amount;
  const rate = amount ? paid / amount : 1;
  return { paid, own: round2(paid - (othersShare ?? 0) * rate) };
}

// Totals of a list: what was paid and the user's part (they differ only when something is shared)
export function totalsOf(records: PaidRecord[]) {
  return records.reduce(
    (totals, record) => {
      const { paid, own } = paidAndOwn(record);
      return { paid: round2(totals.paid + paid), own: round2(totals.own + own) };
    },
    { paid: 0, own: 0 },
  );
}

export interface ExpenseShare {
  personId: string;
  ratio?: number;
  amount?: number;
}

// Each person's part of `total` (a ratio of it or a fixed amount), the user's part and the percentage of each;
// the same rule as sharesOf in kogane-api (never more than the total)
export function shareParts(total: number, shares: ExpenseShare[]) {
  const parts = shares.map((share) => {
    const amount = round2(share.amount ?? total * (share.ratio ?? 0));
    return { personId: share.personId, amount, percent: total ? Math.round((amount / total) * 100) : 0 };
  });
  const others = round2(Math.min(total, parts.reduce((sum, part) => sum + part.amount, 0)));
  return { parts, own: round2(total - others) };
}
