export const CURRENCY_OPTIONS = [
  { value: "PEN", label: "Soles (PEN)" },
  { value: "USD", label: "Dólares (USD)" },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]["value"];
