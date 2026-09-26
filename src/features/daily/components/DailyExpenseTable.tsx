import { useState } from "react";
import { Plus } from "lucide-react";

import { nameById, useCategories, useMe, usePaymentMethods, usePeople } from "@/shared/api/hooks/catalogs";
import { useDeleteExpense, useExpenses, useSaveExpense } from "@/shared/api/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES, type DailyExpense } from "@/shared/api/types";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { DataView, useViewMode, ViewToggle, type Column } from "@/shared/components/DataView";
import { EmptyState } from "@/shared/components/EmptyState";
import { ExpenseFilters } from "@/shared/components/ExpenseFilters";
import { OwnPart } from "@/shared/components/OwnPart";
import { RowActions } from "@/shared/components/RowActions";
import { duplicateBody } from "@/shared/lib/expense-actions";
import { ExpenseEditDialog } from "@/features/expenses/components/ExpenseEditDialog";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { EXPENSE_TYPE_LABELS } from "@/shared/labels";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { applyExpenseFilters, type ExpenseFilterKey, type ExpenseFilterValues } from "@/shared/lib/expense-filters";
import { totalsOf } from "@/shared/lib/shared-expense";
import { useNewExpense } from "@/shared/stores/new-expense.store";
import { usePeriod } from "@/shared/stores/period.store";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

const FILTERS: ExpenseFilterKey[] = ["person", "q", "category", "method", "type", "shared"];

// Día a día ("gastos sin culpa", exp_daily_expenses): what the bot saves most. New ones come from Nuevo gasto or the chat
function DailyExpenseTableView() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const { data: expenses = [], isLoading } = useExpenses(EXPENSE_RESOURCES.daily, { month, year });
  const personName = nameById(usePeople().data);
  const methodName = nameById(usePaymentMethods().data);
  const categoryName = nameById(useCategories().data);
  const deleteExpense = useDeleteExpense(EXPENSE_RESOURCES.daily);
  const saveExpense = useSaveExpense(EXPENSE_RESOURCES.daily);
  const [editing, setEditing] = useState<DailyExpense | undefined>();
  const openNewExpense = useNewExpense((state) => state.openWith);
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(FILTERS);
  const [view, setView] = useViewMode("daily", "table");
  const me = useMe();

  const sorted = applyExpenseFilters(expenses, filters, me).sort((a, b) => b.spentAt.localeCompare(a.spentAt));
  const totals = totalsOf(sorted);

  const columns: Column<DailyExpense>[] = [
    { key: "date", header: "Fecha", cell: (e) => <span className="text-sm text-muted-foreground">{formatDate(e.spentAt)}</span> },
    {
      key: "description",
      header: "Descripción",
      role: "title",
      cell: (e) => (
        <div>
          <span className="font-medium">{e.description}</span>
          {e.expenseType === "guilty_pleasure" && (
            <Badge variant="secondary" className="ml-2 text-xs">{EXPENSE_TYPE_LABELS.guilty_pleasure}</Badge>
          )}
          {e.merchant && <p className="text-xs text-muted-foreground">{e.merchant}</p>}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      cell: (e) => <CurrencyDisplay amount={e.amount} currency={e.currency} amountInPEN={e.amountInPen} othersShare={e.othersShare} />,
    },
    { key: "method", header: "Medio de pago", cell: (e) => <span className="text-sm">{methodName(e.paymentMethodId)}</span> },
    { key: "category", header: "Categoría", cell: (e) => <span className="text-sm">{e.categoryId ? categoryName(e.categoryId) : "—"}</span> },
    { key: "person", header: "Persona", cell: (e) => <span className="text-sm">{personName(e.personId)}</span> },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[50px]",
      cell: (e) => (
        <RowActions
          label={e.description}
          files={{ refType: "expense", refId: e.id }}
          onEdit={() => setEditing(e)}
          onDuplicate={() => saveExpense.mutate({ body: duplicateBody(EXPENSE_RESOURCES.daily, e) })}
          onDelete={() => deleteExpense.mutate(e.id)}
        />
      ),
    },
  ];

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{sorted.length} gastos</p>
          <p className="text-2xl font-bold">{formatCurrency(totals.paid)}</p>
          <OwnPart {...totals} />
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <Button size="sm" onClick={() => openNewExpense({ destination: "daily" })}>
            <Plus className="mr-1 h-4 w-4" /> Nuevo gasto
          </Button>
        </div>
      </div>

      <ExpenseFilters fields={FILTERS} value={filters} onChange={setFilters} shown={sorted.length} total={expenses.length} />

      {sorted.length === 0 ? (
        <EmptyState description={expenses.length ? "No hay gastos con estos filtros" : "No hay gastos del día a día en este mes"} />
      ) : (
        <DataView items={sorted} columns={columns} rowKey={(e) => e.id} view={view} />
      )}

      <ExpenseEditDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(undefined)}
        resource={EXPENSE_RESOURCES.daily}
        expense={editing}
      />
    </div>
  );
}

export const DailyExpenseTable = withQuery(DailyExpenseTableView);
