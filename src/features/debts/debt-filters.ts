import type { Debt } from "@/shared/api/types";

// Filters of Me deben / Debo (D80): a pure function over the open installments already loaded
export interface DebtFilterValues {
  q?: string;
  person?: string;
  state?: "pending" | "partial" | "paid" | "prepaid" | "cashback" | "open" | "late" | "due" | "upcoming";
  month?: string; // 1–12 or "until" against the month of the header
  year?: string;
  origin?: "shared" | "loan";
  card?: string; // the card it was charged on (D114)
}

export const DEBT_FILTER_KEYS: (keyof DebtFilterValues)[] = ["q", "person", "state", "month", "year", "origin", "card"];

const STORED_STATES = ["pending", "partial", "paid", "prepaid", "cashback"];

export const DEBT_STATE_LABELS: Record<NonNullable<DebtFilterValues["state"]>, string> = {
  open: "Por cobrar (con saldo)",
  pending: "No iniciado",
  partial: "Abonado",
  paid: "Pagado",
  prepaid: "Amortizado",
  cashback: "Cashback",
  late: "Vencida",
  due: "Este mes",
  upcoming: "Por venir",
};

// What a payment was (D114), as Notion calls it
export type PaymentKind = "payment" | "partial" | "prepaid" | "cashback";
export const PAYMENT_KIND_LABELS: Record<PaymentKind, string> = {
  payment: "Pago",
  partial: "Abono",
  prepaid: "Amortizado",
  cashback: "Cashback",
};

// A debt without payments reads "No iniciado" like the expenses (D112); its stored status stays pending
export const debtBadgeStatus = (status: string) => (status === "pending" ? "not_started" : status);

// The parts of a shared expense (D73) are saved as "<concepto> (compartido)"
export const isSharedDebt = (debt: Pick<Debt, "description">) => /\(compartido\)$/.test(debt.description);

const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

type FilterableDebt = Pick<
  Debt,
  "description" | "personId" | "status" | "timing" | "paymentMonth" | "paymentYear" | "notes" | "balance"
> & { person: { name: string }; paymentMethodId?: string | null };

export function applyDebtFilters<T extends FilterableDebt>(
  debts: T[],
  filters: DebtFilterValues,
  period: { month: number; year: number },
): T[] {
  const q = filters.q?.trim() ? fold(filters.q.trim()) : null;
  const until = filters.month === "until";
  const selected = (filters.year ? Number(filters.year) : period.year) * 12 + period.month;
  return debts.filter((debt) => {
    const index = debt.paymentYear * 12 + debt.paymentMonth;
    const state = filters.state;
    return (
      (!q || [debt.description, debt.notes, debt.person.name].some((text) => text && fold(text).includes(q))) &&
      (!filters.person || debt.personId === filters.person) &&
      (!state ||
        (state === "open"
          ? debt.balance > 0
          : STORED_STATES.includes(state)
            ? debt.status === state
            : debt.balance > 0 && debt.timing === state)) &&
      (!filters.month || (until ? index <= selected : debt.paymentMonth === Number(filters.month))) &&
      // "Hasta" takes every earlier year too; the year only sets where it stops
      (!filters.year || until || debt.paymentYear === Number(filters.year)) &&
      (!filters.origin || isSharedDebt(debt) === (filters.origin === "shared")) &&
      (!filters.card || debt.paymentMethodId === filters.card)
    );
  });
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];
const soles = (amount: number) => `S/ ${amount.toFixed(2)}`;

// 💬 Cobrar: the same message as /cobrar in the bot, as plain text to paste in WhatsApp
export function buildCollectMessage(name: string, debts: Pick<Debt, "description" | "installment" | "paymentMonth" | "paymentYear" | "balance">[]): string {
  const total = Math.round(debts.reduce((sum, debt) => sum + debt.balance, 0) * 100) / 100;
  return [
    `Hola ${name} 👋, te paso el detalle de lo pendiente:`,
    ...debts.map(
      (debt) =>
        `• ${debt.description}${debt.installment ? ` (cuota ${debt.installment})` : ""}, ${MONTHS[debt.paymentMonth - 1]} ${debt.paymentYear}: ${soles(debt.balance)}`,
    ),
    "",
    `Total: ${soles(total)}`,
    "¡Gracias! 🙌",
  ].join("\n");
}

// Installments grouped by person, biggest balance first
export function groupByPerson<T extends Pick<Debt, "personId" | "balance"> & { person: { name: string } }>(debts: T[]) {
  const groups = new Map<string, { personId: string; name: string; total: number; debts: T[] }>();
  for (const debt of debts) {
    const group = groups.get(debt.personId) ?? { personId: debt.personId, name: debt.person.name, total: 0, debts: [] };
    group.total = Math.round((group.total + debt.balance) * 100) / 100;
    group.debts.push(debt);
    groups.set(debt.personId, group);
  }
  return [...groups.values()].sort((a, b) => b.total - a.total);
}

// Debts grouped by credit card (D114), biggest balance first
export function groupByPaymentMethod<T extends { paymentMethodId?: string | null; balance: number }>(
  debts: T[],
  cardNames: Map<string, string>,
) {
  const groups = new Map<string, { cardId: string | null; cardName: string; total: number; debts: T[] }>();
  for (const debt of debts) {
    const cardId = debt.paymentMethodId ?? null;
    const name = cardId ? cardNames.get(cardId) ?? "Sin tarjeta" : "Sin tarjeta";
    const key = cardId ?? "__no_card__";
    const group = groups.get(key) ?? { cardId, cardName: name, total: 0, debts: [] };
    group.total = Math.round((group.total + debt.balance) * 100) / 100;
    group.debts.push(debt);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.total - a.total);
}
