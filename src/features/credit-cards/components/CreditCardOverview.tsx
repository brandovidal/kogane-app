import { cardHref } from "@/shared/lib/card-links";
import { ArrowRight, Calendar, CreditCard } from "lucide-react";

import { useCreditCards, useMe } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/shared/api/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { DataView, useViewMode, ViewToggle, type Column } from "@/shared/components/DataView";
import { EmptyState } from "@/shared/components/EmptyState";
import { ExpenseFilters } from "@/shared/components/ExpenseFilters";
import { OwnPart } from "@/shared/components/OwnPart";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { CREDIT_CARD_STATUSES } from "@/shared/labels";
import { formatCurrency } from "@/shared/lib/currency";
import { applyExpenseFilters, type ExpenseFilterKey, type ExpenseFilterValues } from "@/shared/lib/expense-filters";
import { totalsOf } from "@/shared/lib/shared-expense";
import { usePeriod } from "@/shared/stores/period.store";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

const FILTERS: ExpenseFilterKey[] = ["person", "q", "category", "status", "installments", "type", "shared"];

interface CardRow {
  id: string;
  href: string;
  name: string;
  color: string | null;
  billingCloseDay: number;
  paymentDueDay: number;
  paid: number;
  own: number;
  count: number;
  pending: number;
}

// Tarjetas (D80): every card with the month's total of the filtered expenses, as cards or as a table
function CreditCardOverviewView() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const creditCards = useCreditCards().data ?? [];
  const expenses = useExpenses(EXPENSE_RESOURCES.creditCard, { month, year }).data ?? [];
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(FILTERS);
  const [view, setView] = useViewMode("cards-overview", "cards");
  const me = useMe();

  const filtered = applyExpenseFilters(expenses, filters, me);
  const rows: CardRow[] = creditCards.map((card) => {
    const ofCard = filtered.filter((expense) => expense.paymentMethodId === card.id);
    const { paid, own } = totalsOf(ofCard);
    return {
      id: card.id,
      href: cardHref(card.code ?? card.id),
      name: card.name,
      color: card.color,
      billingCloseDay: card.billingCloseDay ?? 0,
      paymentDueDay: card.paymentDueDay ?? 0,
      paid,
      own,
      count: ofCard.length,
      pending: ofCard.filter((expense) => expense.paymentStatus === "pending").length,
    };
  });
  const totals = totalsOf(filtered);

  const columns: Column<CardRow>[] = [
    {
      key: "name",
      header: "Tarjeta",
      role: "title",
      cell: (row) => (
        <span className="flex items-center gap-2 font-medium">
          <CreditCard className="h-4 w-4" style={{ color: row.color ?? "var(--muted-foreground)" }} />
          {row.name}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      role: "amount",
      cell: (row) => (
        <div>
          <span className="font-semibold tabular-nums">{formatCurrency(row.paid)}</span>
          <OwnPart paid={row.paid} own={row.own} />
        </div>
      ),
    },
    { key: "count", header: "Movimientos", cell: (row) => <span className="tabular-nums">{row.count}</span> },
    {
      key: "pending",
      header: "Pendientes",
      cell: (row) => (row.pending ? <Badge variant="secondary">{row.pending}</Badge> : <span className="text-muted-foreground">—</span>),
    },
    {
      key: "days",
      header: "Cierre · pago",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.billingCloseDay ? `día ${row.billingCloseDay} · día ${row.paymentDueDay}` : "sin días"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      cell: (row) => (
        <a href={row.href} className="flex items-center gap-1 text-sm text-primary hover:underline">
          Ver detalle <ArrowRight className="h-3.5 w-3.5" />
        </a>
      ),
    },
  ];

  const upcoming = rows.filter((row) => row.paid > 0).sort((a, b) => a.paymentDueDay - b.paymentDueDay);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total tarjetas</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold tabular-nums">{formatCurrency(totals.paid)}</span>
            <OwnPart {...totals} />
            <p className="mt-1 text-xs text-muted-foreground">{filtered.length} movimientos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Próximos vencimientos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!upcoming.length && <p className="text-sm text-muted-foreground">Nada por pagar este mes</p>}
            {upcoming.map((row) => (
              <div key={row.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Día {row.paymentDueDay}
                </span>
                <span className="font-medium">
                  {row.name} · {formatCurrency(row.paid)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ExpenseFilters
          fields={FILTERS}
          value={filters}
          onChange={setFilters}
          statuses={CREDIT_CARD_STATUSES}
          shown={filtered.length}
          total={expenses.length}
        />
        <ViewToggle value={view} onChange={setView} />
      </div>

      {rows.length === 0 ? (
        <EmptyState description="No hay tarjetas activas" />
      ) : (
        <DataView items={rows} columns={columns} rowKey={(row) => row.id} view={view} />
      )}
    </div>
  );
}

export const CreditCardOverview = withQuery(CreditCardOverviewView);
