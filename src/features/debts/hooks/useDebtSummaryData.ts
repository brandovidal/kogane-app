import { useDebts, useCardChecks } from "@/features/debts/hooks/debts";
import { type DebtReportFilter } from "@/features/debts/lib/debt-report";
import { usePaymentMethods, usePeople } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { paidAndOwn } from "@/features/expenses/lib/shared-expense";
import { applyDebtFilters, groupByPerson, type DebtFilterValues } from "@/features/debts/lib/debt-filters";
import type { CardMinimumCoverage } from "../sections/CardMinimumCoverageSection";
import type { PersonalDebtSummaryExpense, StatementChargeAdjustment } from "../sections/PersonDebtSummaryCardList";

type SummaryView = string;

export function useDebtSummaryData({
  month,
  year,
  filters,
  summaryView,
  showCollections,
  showDebts,
}: {
  month: number;
  year: number;
  filters: DebtFilterValues;
  summaryView: SummaryView;
  showCollections: boolean;
  showDebts: boolean;
}) {
  const { data: debts = [], isLoading } = useDebts();
  const paymentMethods = (usePaymentMethods().data ?? []).filter((method) => method.isActive);
  const cardNames = new Map(paymentMethods.map((method) => [method.id, method.name]));
  const open = debts.filter((debt) => debt.balance > 0);
  const shown = applyDebtFilters(open, { ...filters, direction: undefined }, { month, year })
    .filter((debt) => debt.direction === "owed_to_me" ? showCollections : showDebts);
  const groups = groupByPerson(shown);
  const reportFilter: DebtReportFilter = {
    q: filters.q || undefined,
    person: filters.person || undefined,
    state: filters.state,
    month: filters.month === "until" ? month : filters.month ? Number(filters.month) : undefined,
    year: filters.year ? Number(filters.year) : undefined,
    until: filters.month === "until" || undefined,
    origin: filters.origin,
    card: filters.card,
  };
  const owedDebts = shown.filter((debt) => debt.direction === "owed_to_me");
  const debtsIOwe = shown.filter((debt) => debt.direction === "i_owe");
  const totalToCollectBase = owedDebts.reduce((sum, debt) => sum + debt.balance, 0);
  const selectedMonth = filters.month && filters.month !== "until" ? Number(filters.month) : month;
  const selectedYear = filters.year ? Number(filters.year) : year;
  const ownCardExpenses = useExpenses(EXPENSE_RESOURCES.creditCard, { month: selectedMonth, year: selectedYear }).data ?? [];
  const ownFixedCosts = useExpenses(EXPENSE_RESOURCES.fixedCost, { month: selectedMonth, year: selectedYear }).data ?? [];
  const ownSubscriptions = useExpenses(EXPENSE_RESOURCES.subscription, { month: selectedMonth, year: selectedYear }).data ?? [];
  const people = usePeople().data ?? [];
  const ownPerson = people.find((person) => person.isDefault);
  const creditCards = paymentMethods.filter((method) =>
    method.type === "credit_card" && (!filters.card || filters.card === method.id),
  );
  const statementChecks = useCardChecks(creditCards.map((card) => card.id), selectedMonth, selectedYear);
  const minimumCoverage = creditCards.flatMap((card, index) => {
    const check = statementChecks[index]?.data;
    if (!check?.statementId || check.minimumDue == null) return [];
    const currentCharges = check.expensesByPerson.reduce((sum, person) => sum + person.amount, 0);
    const difference = currentCharges - check.minimumDue;
    return [{
      cardId: card.id,
      cardName: card.name,
      minimumDue: check.minimumDue,
      currentCharges,
      difference,
      covered: difference >= -0.005,
      expensesByPerson: check.expensesByPerson,
    }];
  });
  const normalizeSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const matchedStatementDebtIds = new Set<string>();
  const statementChargeAdjustments = statementChecks.flatMap(({ data: check }, index) => {
    if (!showCollections) return [];
    const card = creditCards[index];
    if (!card || !check?.statementId || !/cmr|falabella/i.test(card.name) || filters.state || filters.origin) return [];
    const normalizeCharge = (value: string) => normalizeSearch(value)
      .replace(/\b(compra|del estado de cuenta)\b/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    return check.statementRows.flatMap((row) => {
      const personId = row.personId ?? check.statementPersonId;
      if (!personId || personId === check.statementPersonId || row.result === "ignored") return [];
      if (filters.person && filters.person !== personId) return [];
      const personName = people.find((person) => person.id === personId)?.name ?? check.expensesByPerson.find((person) => person.personId === personId)?.name ?? "Persona";
      const description = row.label ?? row.description;
      if (filters.q && !normalizeSearch(`${card.name} ${description} ${personName}`).includes(normalizeSearch(filters.q))) return [];

      const target = normalizeCharge(description);
      const debt = (row.debtId ? debts.find((item) => item.id === row.debtId && !matchedStatementDebtIds.has(item.id)) : undefined) ?? debts.find((item) =>
        !matchedStatementDebtIds.has(item.id) &&
        item.direction === "owed_to_me" &&
        item.paymentMethodId === card.id &&
        item.personId === personId &&
        item.paymentMonth === selectedMonth &&
        item.paymentYear === selectedYear &&
        normalizeCharge(item.description) === target &&
        (!row.installment || !item.installment || row.installment === item.installment),
      );
      if (debt && (debt.paymentMethodId !== card.id || debt.personId !== personId)) return [];
      if (debt) matchedStatementDebtIds.add(debt.id);

      const amount = debt
        ? Math.max(0, debt.balance + row.amount - debt.amount) - debt.balance
        : row.amount;
      if (Math.abs(amount) < 0.005) return [];
      return [{
        key: `${card.id}:${row.id}`,
        personId,
        personName,
        cardId: card.id,
        cardName: card.name,
        description: debt ? `Ajuste estado: ${description}` : description,
        amount,
        periodMonth: selectedMonth,
        periodYear: selectedYear,
      }];
    });
  });
  const statementAdjustmentTotal = statementChargeAdjustments.reduce((sum, item) => sum + item.amount, 0);
  const totalToCollect = totalToCollectBase + statementAdjustmentTotal;
  const groupedPeople = [...groups];
  for (const adjustment of statementChargeAdjustments) {
    if (!groupedPeople.some((group) => group.personId === adjustment.personId)) {
      groupedPeople.push({ personId: adjustment.personId, name: adjustment.personName, total: 0, debts: [] });
    }
  }
  const sortedGroups = groupedPeople.sort((a, b) =>
    (b.total + statementChargeAdjustments.filter((item) => item.personId === b.personId).reduce((sum, item) => sum + item.amount, 0)) -
    (a.total + statementChargeAdjustments.filter((item) => item.personId === a.personId).reduce((sum, item) => sum + item.amount, 0)),
  );
  const personalExpenses = summaryView === "consolidated" && ownPerson && showDebts && !filters.state && !filters.origin && (!filters.person || filters.person === ownPerson.id)
    ? [
      ...ownCardExpenses
        .filter((expense) => expense.personId === ownPerson.id && ["not_started", "pending"].includes(expense.paymentStatus))
        .filter((expense) => !/cmr|falabella/i.test(expense.paymentMethodId ? cardNames.get(expense.paymentMethodId) ?? "" : ""))
        .filter((expense) => !filters.card || filters.card === expense.paymentMethodId)
        .filter((expense) => !filters.q || normalizeSearch(`${expense.description} ${expense.paymentMethodId ? cardNames.get(expense.paymentMethodId) ?? "" : ""} IO`).includes(normalizeSearch(filters.q)))
        .filter((expense) => !debts.some((debt) => debt.personId === ownPerson.id && debt.paymentMethodId === expense.paymentMethodId && debt.paymentMonth === selectedMonth && debt.paymentYear === selectedYear && normalizeSearch(debt.description) === normalizeSearch(expense.description) && Math.abs(debt.amount - (expense.amountInPen ?? expense.amount)) < 0.01))
        .map((expense) => ({ id: `card:${expense.id}`, personId: ownPerson.id, description: expense.description, amount: paidAndOwn(expense).own, source: cardNames.get(expense.paymentMethodId) ?? "Tarjeta", paymentMethodId: expense.paymentMethodId })),
      ...ownFixedCosts
        .filter((expense) => expense.personId === ownPerson.id && ["not_started", "pending"].includes(expense.paymentStatus))
        .filter((expense) => !filters.card || expense.paymentMethodId === filters.card)
        .filter((expense) => !filters.q || normalizeSearch(`${expense.description} costos fijos`).includes(normalizeSearch(filters.q)))
        .filter((expense) => !debts.some((debt) => debt.personId === ownPerson.id && debt.paymentMethodId === expense.paymentMethodId && debt.paymentMonth === selectedMonth && debt.paymentYear === selectedYear && normalizeSearch(debt.description) === normalizeSearch(expense.description) && Math.abs(debt.amount - (expense.amountInPen ?? expense.amount)) < 0.01))
        .map((expense) => ({ id: `fixed:${expense.id}`, personId: ownPerson.id, description: expense.description, amount: paidAndOwn(expense).own, source: "Costos fijos", paymentMethodId: expense.paymentMethodId })),
      ...ownSubscriptions
        .filter((expense) => expense.personId === ownPerson.id && ["not_started", "pending"].includes(expense.paymentStatus))
        .filter((expense) => !filters.card || expense.paymentMethodId === filters.card)
        .filter((expense) => !filters.q || normalizeSearch(`${expense.description} ${expense.kind === "platform" ? "plataformas" : "recurrentes"}`).includes(normalizeSearch(filters.q)))
        .filter((expense) => !debts.some((debt) => debt.personId === ownPerson.id && debt.paymentMethodId === expense.paymentMethodId && debt.paymentMonth === selectedMonth && debt.paymentYear === selectedYear && normalizeSearch(debt.description) === normalizeSearch(expense.description) && Math.abs(debt.amount - (expense.amountInPen ?? expense.amount)) < 0.01))
        .map((expense) => ({ id: `subscription:${expense.id}`, personId: ownPerson.id, description: expense.description, amount: paidAndOwn(expense).own, source: expense.kind === "platform" ? "Plataformas" : "Recurrentes", paymentMethodId: expense.paymentMethodId })),
    ].filter((expense) => expense.amount > 0)
    : [];
  const personalExpenseTotal = personalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalToPayBase = debtsIOwe.reduce((sum, debt) => sum + debt.balance, 0);
  const totalToPay = totalToPayBase + (summaryView === "consolidated" ? personalExpenseTotal : 0);
  const netTotal = totalToCollect - totalToPay;


  const visibleGroups = summaryView === "consolidated" ? sortedGroups : groupedPeople;
  if (ownPerson && personalExpenses.length && !visibleGroups.some((group) => group.personId === ownPerson.id)) {
    visibleGroups.push({ personId: ownPerson.id, name: ownPerson.name, total: 0, debts: [] });
  }
  const byMonth = visibleGroups.flatMap((group) => {
    const months = new Map<
      number,
      { month: number; year: number; owed: number; owe: number }
    >();
    for (const debt of group.debts) {
      const key = debt.paymentYear * 12 + debt.paymentMonth;
      const row = months.get(key) ?? {
        month: debt.paymentMonth,
        year: debt.paymentYear,
        owed: 0,
        owe: 0,
      };
      if (debt.direction === "owed_to_me") row.owed += debt.balance;
      else row.owe += debt.balance;
      months.set(key, row);
    }
    const rows = [...months.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, row]) => ({ name: group.name, ...row, concept: "" }));
    for (const adjustment of statementChargeAdjustments.filter((item) => item.personId === group.personId)) {
      rows.push({
        name: group.name,
        month: adjustment.periodMonth,
        year: adjustment.periodYear,
        owed: adjustment.amount,
        owe: 0,
        concept: `${adjustment.cardName} · ${adjustment.description}`,
      });
    }
    for (const expense of personalExpenses.filter((item) => item.personId === group.personId)) {
      rows.push({
        name: group.name,
        month: selectedMonth,
        year: selectedYear,
        owed: 0,
        owe: expense.amount,
        concept: `${expense.source} · ${expense.description}`,
      });
    }
    return rows;
  });
  return {
    isLoading,
    debts,
    paymentMethods,
    cardNames,
    open,
    shown,
    reportFilter,
    totalToCollect,
    selectedMonth,
    selectedYear,
    creditCards,
    statementChecks,
    minimumCoverage: minimumCoverage as CardMinimumCoverage[],
    statementChargeAdjustments: statementChargeAdjustments as StatementChargeAdjustment[],
    personalExpenses: personalExpenses as PersonalDebtSummaryExpense[],
    groups,
    visibleGroups,
    byMonth,
    totalToPay,
    netTotal,
  };
}
