export type PaymentOutcome = "pending" | "in_progress" | "paid";

export interface PaymentPreview {
  /** Balance before the payment. */
  current: number;
  /** Amount applied, never more than the balance. */
  applied: number;
  /** Balance left once the payment is registered. */
  after: number;
  outcome: PaymentOutcome;
}

const EPSILON = 0.005;
const cents = (value: number) => Math.round(value * 100) / 100;

/** What a payment leaves behind: balance after it and the status the debt will have (board Registrar pago). */
export function previewPayment(
  balance: number,
  amount: number,
): PaymentPreview {
  const current = Math.max(balance, 0);
  const applied = Number.isFinite(amount)
    ? Math.min(Math.max(amount, 0), current)
    : 0;
  const after = cents(Math.max(current - applied, 0));
  const outcome: PaymentOutcome =
    applied < EPSILON ? "pending" : after < EPSILON ? "paid" : "in_progress";
  return {
    current,
    applied,
    after: after < EPSILON ? 0 : after,
    outcome,
  };
}

export const PAYMENT_OUTCOME_LABELS: Record<PaymentOutcome, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  paid: "Pagado",
};
