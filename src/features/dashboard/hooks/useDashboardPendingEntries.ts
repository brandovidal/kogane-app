import { useEffect, useMemo, useState } from "react";
import type { PendingEntry } from "../lib/pending-groups";
import { DASHBOARD_CLOSED_EXPENSE_STATUSES } from "../constants/dashboard";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { useDebts } from "@/features/debts/hooks/debts";
import { useDraftCount } from "@/features/drafts/hooks/drafts";
import { usePersonSummaries } from "@/features/debts/hooks/personSummaries";
import { useCreditCards } from "@/shared/api/hooks/catalogs";
import { EXPENSE_RESOURCES, type PaymentMethod, type Summary } from "@/shared/api/types";
import { getMonthName } from "@/shared/lib/dates";
import { pluralize } from "../lib/pending-groups";

const EMPTY_CARDS: PaymentMethod[] = [];

export function useDashboardPendingEntries(summary: Summary | undefined, month: number, year: number, onlySelectedMonth: boolean) {
  const period = onlySelectedMonth ? { month, year } : undefined;
  const fixedCostsQuery = useExpenses(EXPENSE_RESOURCES.fixedCost, period);
  const cardExpensesQuery = useExpenses(EXPENSE_RESOURCES.creditCard, period);
  const debtsQuery = useDebts();
  const personSummaries = usePersonSummaries(month, year).data;
  const cards = useCreditCards().data ?? EMPTY_CARDS;
  const draftCount = useDraftCount().data ?? 0;
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => setToday(new Date()), []);

  const entries = useMemo<PendingEntry[]>(() => {
    const open = (status: string) => !(DASHBOARD_CLOSED_EXPENSE_STATUSES as readonly string[]).includes(status);
    const fixedCosts = fixedCostsQuery.data ?? [];
    const cardExpenses = cardExpensesQuery.data ?? [];
    const debts = debtsQuery.data ?? [];
    const costItems: PendingEntry[] = fixedCosts
      .filter((cost) => open(cost.paymentStatus))
      .map((cost) => ({
        id: `cost-${cost.id}`,
        kind: "fixed",
        title: cost.description,
        detail: `Costo fijo · ${cost.installment ?? "Pendiente"}`,
        amount: cost.amountInPen ?? cost.amount,
        dueDate: cost.dueDate,
        href: `/costos-fijos?scope=payable&month=${month}&year=${year}`,
        action: "Pagar",
      }));
    const cardItems: PendingEntry[] = cards.flatMap((card) => {
      const expenses = cardExpenses.filter((expense) => expense.paymentMethodId === card.id && open(expense.paymentStatus));
      if (!expenses.length) return [];
      const dueDay = card.paymentDueDay ?? 0;
      const now = today ?? new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let due: Date | null =
        dueDay > 0 ? (onlySelectedMonth ? new Date(year, month - 1, dueDay) : new Date(now.getFullYear(), now.getMonth(), dueDay)) : null;
      if (due && !onlySelectedMonth && due < todayStart) due = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
      const dueDate = due ? `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}` : null;
      return [
        {
          id: `card-${card.id}`,
          kind: "card",
          title: card.name,
          detail: `${expenses.length} ${expenses.length === 1 ? "movimiento" : "movimientos"} · pago de tarjeta`,
          amount: expenses.reduce((sum, expense) => sum + (expense.amountInPen ?? expense.amount), 0),
          dueDate,
          href: "/tarjetas",
          action: "Pagar",
        },
      ];
    });
    const periodIndex = year * 12 + month;
    const now = new Date();
    const previousPeriod = periodIndex < now.getFullYear() * 12 + now.getMonth() + 1;
    const debtItems: PendingEntry[] = debts
      .filter(
        (debt) =>
          (!onlySelectedMonth || debt.paymentYear * 12 + debt.paymentMonth === periodIndex) && debt.status !== "paid" && debt.status !== "cashback",
      )
      .map((debt) => {
        const collect = debt.direction === "owed_to_me";
        const carried =
          debt.paymentYear * 12 + debt.paymentMonth < periodIndex ? ` · Arrastrada de ${getMonthName(debt.paymentMonth).toLowerCase()}` : "";
        return {
          id: `debt-${debt.id}`,
          kind: collect ? "collect" : "debt",
          title: debt.description,
          detail: `${collect ? "Cobro" : "Deuda"} · ${debt.person.name}${debt.installment ? ` · ${debt.installment}` : ""}${carried}`,
          amount: debt.balance,
          dueDate: debt.dueDate,
          person: debt.person.name,
          href: collect ? "/cobros" : "/deudas",
          action: collect ? "Cobrar" : "Pagar",
        };
      });
    const paidCardItems: PendingEntry[] =
      onlySelectedMonth && previousPeriod
        ? cards.flatMap((card) => {
            const total = cardExpenses
              .filter((expense) => expense.paymentMethodId === card.id && expense.paymentStatus === "paid")
              .reduce((sum, expense) => sum + (expense.amountInPen ?? expense.amount), 0);
            return total > 0
              ? [
                  {
                    id: `card-paid-${card.id}`,
                    kind: "card" as const,
                    title: `${card.name} · tarjeta pagada`,
                    detail: "Pago registrado en este período",
                    amount: total,
                    dueDate: null,
                    paid: true,
                    href: "/tarjetas",
                    action: "Ver tarjeta",
                  },
                ]
              : [];
          })
        : [];
    const reviewItems: PendingEntry[] = [];
    if (summary?.budget?.isProposal)
      reviewItems.push({
        id: "budget-proposal",
        kind: "review",
        title: "Sueldo del mes en borrador",
        detail: "Confirma el ingreso para actualizar tu presupuesto",
        amount: summary.budget.salary,
        dueDate: null,
        href: "/resumen",
        action: "Revisar",
      });
    if (!previousPeriod && personSummaries) {
      const statusOf = new Map(personSummaries.map((item) => [item.personId, item]));
      const owed = new Map<string, number>();
      for (const debt of debts) {
        if (debt.direction !== "owed_to_me" || debt.paymentMonth !== month || debt.paymentYear !== year || debt.balance <= 0) continue;
        owed.set(debt.person.id, (owed.get(debt.person.id) ?? 0) + debt.balance);
      }
      const drafts = [...owed.entries()].filter(([personId]) => (statusOf.get(personId)?.status ?? "draft") === "draft");
      if (drafts.length)
        reviewItems.push({
          id: "person-summaries-draft",
          kind: "review",
          title: `Resumen de ${getMonthName(month).toLowerCase()} en borrador`,
          detail: `${pluralize(drafts.length, "persona", "personas")} · pasa a En progreso al cerrar el mes`,
          amount: drafts.reduce((sum, [personId, balance]) => sum + balance + (statusOf.get(personId)?.adjustmentTotal ?? 0), 0),
          dueDate: null,
          href: "/resumen-deudas",
          action: "Revisar",
        });
    }
    if (draftCount > 0)
      reviewItems.push({
        id: "drafts",
        kind: "review",
        title: "Borrador sin confirmar",
        detail: `${draftCount} ${draftCount === 1 ? "movimiento" : "movimientos"} · pendientes de revisión`,
        amount: null,
        dueDate: null,
        href: "/borrador",
        action: "Revisar",
      });
    return [...cardItems, ...costItems, ...debtItems, ...reviewItems, ...paidCardItems];
  }, [
    fixedCostsQuery.data,
    cardExpensesQuery.data,
    debtsQuery.data,
    cards,
    month,
    year,
    summary?.budget,
    draftCount,
    personSummaries,
    onlySelectedMonth,
    today,
  ]);

  return { entries, today, draftCount };
}
