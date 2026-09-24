import type { Debt } from "@/shared/api/types";

// Filters of Me deben / Debo (D80): a pure function over the open installments already loaded
export interface DebtFilterValues {
  q?: string;
  person?: string;
  state?: "pending" | "partial" | "late" | "due" | "upcoming";
  month?: "only" | "until"; // against the month of the header; empty: every month
  origin?: "shared" | "loan";
}

export const DEBT_FILTER_KEYS: (keyof DebtFilterValues)[] = ["q", "person", "state", "month", "origin"];

export const DEBT_STATE_LABELS: Record<NonNullable<DebtFilterValues["state"]>, string> = {
  pending: "Pendiente",
  partial: "Abonado",
  late: "Vencida",
  due: "Este mes",
  upcoming: "Por venir",
};

// The parts of a shared expense (D73) are saved as "<concepto> (compartido)"
export const isSharedDebt = (debt: Pick<Debt, "description">) => /\(compartido\)$/.test(debt.description);

const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

type FilterableDebt = Pick<
  Debt,
  "description" | "personId" | "status" | "timing" | "paymentMonth" | "paymentYear" | "notes"
> & { person: { name: string } };

export function applyDebtFilters<T extends FilterableDebt>(
  debts: T[],
  filters: DebtFilterValues,
  period: { month: number; year: number },
): T[] {
  const q = filters.q?.trim() ? fold(filters.q.trim()) : null;
  const selected = period.year * 12 + period.month;
  return debts.filter((debt) => {
    const index = debt.paymentYear * 12 + debt.paymentMonth;
    const state = filters.state;
    return (
      (!q || [debt.description, debt.notes, debt.person.name].some((text) => text && fold(text).includes(q))) &&
      (!filters.person || debt.personId === filters.person) &&
      (!state ||
        (state === "pending" || state === "partial" ? debt.status === state : debt.timing === state)) &&
      (!filters.month || (filters.month === "only" ? index === selected : index <= selected)) &&
      (!filters.origin || isSharedDebt(debt) === (filters.origin === "shared"))
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
