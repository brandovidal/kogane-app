export interface DebtReportFilter {
  direction?: "owed_to_me" | "i_owe";
  month?: number;
  year?: number;
  until?: boolean;
  person?: string;
  state?:
    | "pending"
    | "partial"
    | "paid"
    | "prepaid"
    | "cashback"
    | "open"
    | "late"
    | "due"
    | "upcoming";
  card?: string;
  origin?: "shared" | "loan";
  q?: string;
}

// Excel / PDF of the debts (D39), with the same filters selected on screen
export function debtReportUrl(
  format: "xlsx" | "pdf",
  personId?: string,
  filter: DebtReportFilter = {},
): string {
  const query = new URLSearchParams({
    format,
    ...(personId ? { personId } : {}),
  });
  if (filter.direction) query.set("direction", filter.direction);
  if (filter.month) query.set("month", String(filter.month));
  if (filter.year) query.set("year", String(filter.year));
  if (filter.until) query.set("until", "true");
  if (filter.person) query.set("person", filter.person);
  if (filter.state) query.set("state", filter.state);
  if (filter.card) query.set("card", filter.card);
  if (filter.origin) query.set("origin", filter.origin);
  if (filter.q) query.set("q", filter.q);
  return `/api/v1/reports/debts?${query}`;
}
