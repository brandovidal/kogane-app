const PEN_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function formatCurrency(
  amount: number,
  currency: string = "PEN",
): string {
  return currency === "USD"
    ? USD_FORMATTER.format(amount)
    : PEN_FORMATTER.format(amount);
}

export function convertToPEN(amount: number, exchangeRate: number): number {
  return Math.round(amount * exchangeRate * 100) / 100;
}

export function calculateAmountInPEN(
  amount: number,
  currency: string,
  exchangeRate?: number | null,
): number {
  if (currency === "PEN") return amount;
  if (!exchangeRate)
    throw new Error("Exchange rate required for non-PEN currency");
  return convertToPEN(amount, exchangeRate);
}
