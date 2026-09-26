import type { Debt } from "@/shared/api/types";

// Filters of Me deben / Debo (D80): a pure function over the open installments already loaded
export interface DebtFilterValues {
  q?: string;
  person?: string;
  direction?: Debt["direction"];
  state?: "pending" | "partial" | "paid" | "prepaid" | "cashback" | "open" | "late" | "due" | "upcoming";
  month?: string; // 1–12 or "until" against the month of the header
  year?: string;
  origin?: "shared" | "loan";
  card?: string; // the card it was charged on (D114)
}

export const DEBT_FILTER_KEYS: (keyof DebtFilterValues)[] = ["q", "person", "direction", "state", "month", "year", "origin", "card"];

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
  "description" | "personId" | "direction" | "status" | "timing" | "paymentMonth" | "paymentYear" | "notes" | "balance"
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
      (!filters.direction || debt.direction === filters.direction) &&
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

// Cobrar from a grouped person row: own debts stay itemized while each card/platform is summarized once.
export function buildCollectSummaryMessage(
  name: string,
  debts: Debt[],
  cardNames: Map<string, string>,
  additionalCharges: { description: string; amount: number; periodMonth: number; periodYear: number }[] = [],
  fullSummary?: {
    debts: Debt[];
    personalExpenses: { description: string; amount: number; source: string }[];
  },
): string {
  if (fullSummary) {
    type SummaryGroup = { name: string; count: number; owed: number; owe: number };
    const summaryGroups = new Map<string, SummaryGroup>();
    const add = (key: string, label: string, direction: "owed_to_me" | "i_owe", amount: number) => {
      const group = summaryGroups.get(key) ?? { name: label, count: 0, owed: 0, owe: 0 };
      group.count += 1;
      if (direction === "owed_to_me") group.owed += amount;
      else group.owe += amount;
      summaryGroups.set(key, group);
    };
    for (const debt of fullSummary.debts) {
      const words = fold(`${debt.description} ${debt.notes ?? ""}`);
      const cardName = debt.paymentMethodId ? cardNames.get(debt.paymentMethodId) : undefined;
      const isPlatform = PLATFORM_CHARGE.test(words);
      const isIo = /\bisil\b/.test(words);
      const isLoan = /pr[eé]stamo/.test(words);
      const label = cardName
        ? /cmr|falabella/i.test(cardName) ? "CMR (Falabella)" : cardName
        : isIo ? "IO"
          : isPlatform ? "Plataformas · Stream"
            : isLoan ? "Préstamo" : debt.description.trim();
      const canGroup = Boolean(cardName) || isIo || isPlatform || isLoan;
      add(canGroup ? label : `${label}:${debt.id}`, label, debt.direction, debt.balance);
    }
    for (const charge of additionalCharges) {
      const label = "CMR (Falabella)";
      add(label, label, "owed_to_me", charge.amount);
    }
    for (const expense of fullSummary.personalExpenses) {
      add(expense.source, expense.source, "i_owe", expense.amount);
    }
    const groups = [...summaryGroups.values()];
    const totalOwed = groups.reduce((sum, group) => sum + group.owed, 0);
    const totalOwe = groups.reduce((sum, group) => sum + group.owe, 0);
    const net = totalOwed - totalOwe;
    const recordCount = fullSummary.debts.length + additionalCharges.length + fullSummary.personalExpenses.length;
    const amount = (value: number) => soles(Math.abs(Math.round(value * 100) / 100));
    return [
      `*${name} · resumen de saldos*`,
      `Me debe ${amount(totalOwed)} · Le debo ${amount(totalOwe)}`,
      `*Neto ${net < 0 ? "−" : ""}${amount(net)} ${net > 0 ? "por cobrar" : net < 0 ? "por pagar" : "saldado"}*`,
      "",
      ...groups.map((group) => {
        const count = `${group.count} ${group.count === 1 ? "registro" : "registros"}`;
        const amounts = [
          group.owed > 0 ? `+ ${amount(group.owed)}` : "",
          group.owe > 0 ? `− ${amount(group.owe)}` : "",
        ].filter(Boolean).join(" · ");
        return `*${group.name}* · ${count} · ${amounts}`;
      }),
      "",
      `*Total registros: ${recordCount} ${recordCount === 1 ? "registro" : "registros"} · ${net < 0 ? "−" : ""}${amount(net)}*`,
    ].join("\n");
  }

  const groups = groupByPersonAndType(debts, cardNames);
  const lines = groups.flatMap((group) => {
    if (group.type === "Deuda propia") {
      return group.debts.map(
        (debt) =>
          `• ${debt.description}${debt.installment ? ` (cuota ${debt.installment})` : ""}, ${MONTHS[debt.paymentMonth - 1]} ${debt.paymentYear}: ${soles(debt.balance)}`,
      );
    }
    const label = /cmr|falabella/i.test(group.type) ? "CMR (Falabella)" : group.type === "Plataformas" ? "Plataformas · Stream" : group.type;
    const singular = group.debts.length === 1;
    const countLabel = group.type === "Plataformas"
      ? singular ? "cargo" : "cargos"
      : singular ? "cuota" : "cuotas";
    return [`• ${label} · ${group.debts.length} ${countLabel}: ${soles(group.total)}`];
  });
  const total = Math.round(debts.reduce((sum, debt) => sum + debt.balance, 0) * 100) / 100;
  const additionalTotal = Math.round(additionalCharges.reduce((sum, charge) => sum + charge.amount, 0) * 100) / 100;
  const additionalLines = additionalCharges.map((charge) =>
    `• CMR (Falabella) · ${charge.description}, ${MONTHS[charge.periodMonth - 1]} ${charge.periodYear}: ${charge.amount < 0 ? "−" : "+"}${soles(Math.abs(charge.amount))}`,
  );
  return [
    `Hola ${name} 👋, te paso el resumen de lo pendiente:`,
    ...lines,
    ...additionalLines,
    "",
    `Total: ${soles(total + additionalTotal)}`,
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

// Compact Cobros summaries (person × type): card purchases together, streaming/platform charges together, and other
// personal debts together. The detail remains available inside each collapsed summary.
const PLATFORM_CHARGE =
  /\b(stream|streaming|plataforma|netflix|spotify|youtube|icloud|disney|hbo|max|prime video|apple tv|paramount|crunchyroll|deezer|tidal|mubi|google one|dropbox)\b/;

export function groupByPersonAndType<T extends Pick<Debt, "personId" | "balance" | "description" | "notes"> & {
  person: { name: string };
  paymentMethodId?: string | null;
}>(debts: T[], cardNames: Map<string, string>) {
  const groups = new Map<
    string,
    { key: string; personId: string; name: string; type: string; total: number; debts: T[] }
  >();
  for (const debt of debts) {
    const words = fold(`${debt.description} ${debt.notes ?? ""}`);
    const typeKey = PLATFORM_CHARGE.test(words)
      ? "platform"
      : debt.paymentMethodId
        ? `card:${debt.paymentMethodId}`
        : "own-debt";
    const type =
      typeKey === "platform"
        ? "Plataformas"
        : typeKey === "own-debt"
          ? "Deuda propia"
          : cardNames.get(debt.paymentMethodId!) ?? "Tarjeta";
    const key = `${debt.personId}:${typeKey}`;
    const group = groups.get(key) ?? {
      key,
      personId: debt.personId,
      name: debt.person.name,
      type,
      total: 0,
      debts: [],
    };
    group.total = Math.round((group.total + debt.balance) * 100) / 100;
    group.debts.push(debt);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.total - a.total);
}
