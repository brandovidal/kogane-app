import type { CreditCardExpense, PaymentMethod } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { GroupedDataView } from "@/shared/components/data-display/GroupedDataView";
import { CurrencyDisplay } from "@/features/expenses/components/CurrencyDisplay";
import { NameAvatar } from "@/shared/components/data-display/NameAvatar";
import type { Column } from "@/shared/types/data-view";
import type { ViewMode } from "@/shared/types/data-view";
import type { CardOverviewGroupBy } from "../../constants/filters";

export function CardOverviewMovements({
  expenses,
  cards,
  personName,
  installmentsOnly = false,
  currencyView = false,
  groupBy = [],
  layout = "table",
}: {
  expenses: CreditCardExpense[];
  cards: PaymentMethod[];
  personName: (id: string | null | undefined) => string;
  installmentsOnly?: boolean;
  currencyView?: boolean;
  groupBy?: CardOverviewGroupBy[];
  layout?: ViewMode;
}) {
  const visible = (
    installmentsOnly
      ? expenses.filter((expense) => !!expense.installment)
      : expenses
  )
    .slice()
    .sort((a, b) => (b.processDate ?? "").localeCompare(a.processDate ?? ""));
  const cardById = new Map(cards.map((card) => [card.id, card]));
  if (!visible.length)
    return (
      <EmptyState
        title={installmentsOnly ? "Sin cuotas" : "Sin movimientos"}
        description={
          installmentsOnly
            ? "No hay compras en cuotas para este período."
            : "No hay movimientos con estos filtros."
        }
      />
    );

  const columns: Column<CreditCardExpense>[] = [
    {
      key: "description",
      header: "Descripción",
      role: "title",
      accessor: (expense) => expense.description,
      cell: (expense) => (
        <div className="min-w-0">
          <span className="font-medium">{expense.description}</span>
          {expense.notes && (
            <span className="block truncate text-xs text-muted-foreground">
              {expense.notes}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "card",
      header: "Tarjeta",
      accessor: (expense) =>
        cardById.get(expense.paymentMethodId ?? "")?.name ?? "—",
      cell: (expense) => {
        const card = cardById.get(expense.paymentMethodId ?? "");
        return (
          <span className="inline-flex items-center gap-2">
            <span
              className="size-4 rounded"
              style={{ backgroundColor: card?.color ?? "var(--muted)" }}
              aria-hidden="true"
            />
            {card?.name ?? "—"}
          </span>
        );
      },
    },
    {
      key: "installment",
      header: "Cuota",
      accessor: (expense) => expense.installment ?? "",
      cell: (expense) => expense.installment ?? "—",
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      accessor: (expense) => expense.amountInPen ?? expense.amount,
      cell: (expense) => (
        <CurrencyDisplay
          amount={expense.amount}
          currency={expense.currency}
          amountInPEN={expense.amountInPen}
          othersShare={expense.othersShare}
        />
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (expense) => <StatusBadge status={expense.paymentStatus} />,
    },
    {
      key: "person",
      header: "Persona",
      accessor: (expense) => personName(expense.personId),
      cell: (expense) => {
        const name = personName(expense.personId);
        return (
          <span className="inline-flex items-center gap-2">
            <NameAvatar name={name} unassigned={!expense.personId} />
            {name}
          </span>
        );
      },
    },
    {
      key: "date",
      header: "Fecha",
      accessor: (expense) => expense.processDate ?? "",
      cell: (expense) =>
        expense.processDate ? formatDate(expense.processDate) : "—",
    },
  ];
  const grouping = [
    ...(currencyView && !groupBy.includes("currency")
      ? ["currency" as const]
      : []),
    ...groupBy,
  ];
  const groupKey = (expense: CreditCardExpense, field: string) => {
    if (field === "currency") return expense.currency ?? "PEN";
    if (field === "person") return expense.personId ?? "none";
    if (field === "installments")
      return expense.installment ? "installments" : "without-installments";
    const bank = cardById.get(expense.paymentMethodId ?? "")?.bank?.trim();
    return bank || "none";
  };
  const groupLabel = (key: string, field: string) => {
    if (key === "none") return field === "bank" ? "Sin banco" : "Sin asignar";
    if (field === "currency")
      return key === "USD" ? "Dólares (USD)" : "Soles (PEN)";
    if (field === "person") return personName(key);
    if (field === "installments")
      return key === "installments" ? "Con cuotas" : "Sin cuotas";
    return key;
  };
  const totals = visible.reduce(
    (sum, expense) => {
      if (expense.currency === "USD") sum.usd += expense.amount;
      else sum.pen += expense.amount;
      return sum;
    },
    { pen: 0, usd: 0 },
  );
  const footer = (
    <div className="flex items-center justify-between gap-3 border-t px-3 py-2.5 text-sm">
      <span className="text-muted-foreground">
        {visible.length} {visible.length === 1 ? "movimiento" : "movimientos"}
      </span>
      <span className="font-semibold tabular-nums">
        {currencyView ? (
          <span className="flex flex-col items-end">
            {totals.pen > 0 && <span>{formatCurrency(totals.pen, "PEN")}</span>}
            {totals.usd > 0 && <span>{formatCurrency(totals.usd, "USD")}</span>}
          </span>
        ) : (
          formatCurrency(
            visible.reduce(
              (sum, expense) => sum + (expense.amountInPen ?? expense.amount),
              0,
            ),
          )
        )}
      </span>
    </div>
  );

  return (
    <GroupedDataView
      items={visible}
      columns={columns}
      rowKey={(expense) => expense.id}
      view={layout}
      groupBy={grouping}
      groupKey={groupKey}
      groupLabel={groupLabel}
      footer={footer}
      tableClassName="credit-card-surface"
    />
  );
}
