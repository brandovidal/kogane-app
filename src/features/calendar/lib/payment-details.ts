import type { PayEventDto } from "../types/calendar.dto";

export type PayMethod = NonNullable<PayEventDto["method"]>;
export type PayKind = NonNullable<PayEventDto["kind"]>;

export const PAY_METHODS: [PayMethod, string][] = [
  ["transfer", "Transferencia"],
  ["cash", "Efectivo"],
  ["wallet", "Billetera (Yape, Plin)"],
  ["debit_card", "Tarjeta de débito"],
  ["other", "Otro"],
];

export const PAY_KINDS: [PayKind, string][] = [
  ["total", "Total"],
  ["minimum", "Pago mínimo"],
  ["partial", "Parcial"],
];

// Fields shared by every payment of the batch
export interface PayDetails {
  paidAt: string; // yyyy-mm-dd
  method: PayMethod | "";
  accountId: string;
  note: string;
}

// Only when a single element is selected: a different amount, or the kind of a card statement
export interface PayAmount {
  amount: string;
  kind: PayKind;
}

export const emptyPayDetails = (today: string): PayDetails => ({
  paidAt: today,
  method: "",
  accountId: "",
  note: "",
});

export const emptyPayAmount = (): PayAmount => ({ amount: "", kind: "total" });

// Request of one payment. Empty fields are left out so the API keeps its defaults (today, full balance, total)
export function buildPayBody(event: { refType: string; refId: string }, details: PayDetails, single: PayAmount | null): PayEventDto {
  const body: PayEventDto = {
    refType: event.refType as PayEventDto["refType"],
    refId: event.refId,
  };
  if (details.paidAt) body.paidAt = details.paidAt;
  if (details.method) body.method = details.method;
  if (details.accountId) body.accountId = details.accountId;
  if (details.note.trim()) body.note = details.note.trim();
  if (single) {
    const amount = Number(single.amount.replace(",", "."));
    if (single.amount.trim() !== "" && Number.isFinite(amount)) body.amount = amount;
    if (event.refType === "card_statement" && single.kind !== "total") body.kind = single.kind;
  }
  return body;
}

// "Pago mínimo" takes the amount from the statement; "Parcial" needs one
export function payAmountError(event: { refType: string }, single: PayAmount | null): string | null {
  if (!single) return null;
  const amount = Number(single.amount.replace(",", "."));
  if (single.amount.trim() !== "" && !(Number.isFinite(amount) && amount > 0)) return "El monto debe ser mayor que cero";
  if (event.refType === "card_statement" && single.kind === "partial" && !(amount > 0)) return "Indica cuánto vas a pagar";
  return null;
}
