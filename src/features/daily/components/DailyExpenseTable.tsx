import { Plus, Trash2 } from "lucide-react";
import { OwnPart } from "@/shared/components/OwnPart";
import { totalsOf } from "@/shared/lib/shared-expense";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { EmptyState } from "@/shared/components/EmptyState";
import { nameById, useCategories, usePaymentMethods, usePeople } from "@/shared/api/hooks/catalogs";
import { useDeleteExpense, useExpenses } from "@/shared/api/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { EXPENSE_TYPE_LABELS } from "@/shared/labels";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";
import { ExpenseFilters } from "@/shared/components/ExpenseFilters";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { applyExpenseFilters, type ExpenseFilterKey, type ExpenseFilterValues } from "@/shared/lib/expense-filters";
import { useNewExpense } from "@/shared/stores/new-expense.store";

const FILTERS: ExpenseFilterKey[] = ["q", "category", "method", "type", "shared"];

// Día a día ("gastos sin culpa", exp_daily_expenses): what the bot saves most. New ones come from Nuevo gasto or the chat
function DailyExpenseTableView() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const { data: expenses = [], isLoading } = useExpenses(EXPENSE_RESOURCES.daily, { month, year }, { byPerson: true });
  const personName = nameById(usePeople().data);
  const methodName = nameById(usePaymentMethods().data);
  const categories = useCategories().data ?? [];
  const deleteExpense = useDeleteExpense(EXPENSE_RESOURCES.daily);
  const openNewExpense = useNewExpense((state) => state.openWith);
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(FILTERS);

  const sorted = applyExpenseFilters(expenses, filters).sort((a, b) => b.spentAt.localeCompare(a.spentAt));
  const totals = totalsOf(sorted);

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{sorted.length} gastos</p>
          <p className="text-2xl font-bold">{formatCurrency(totals.paid)}</p>
          <OwnPart {...totals} />
        </div>
        <Button size="sm" onClick={() => openNewExpense({ destination: "daily" })}>
          <Plus className="mr-1 h-4 w-4" /> Nuevo gasto
        </Button>
      </div>

      <ExpenseFilters fields={FILTERS} value={filters} onChange={setFilters} shown={sorted.length} total={expenses.length} />

      {sorted.length === 0 ? (
        <EmptyState description={expenses.length ? "No hay gastos con estos filtros" : "No hay gastos del día a día en este mes"} />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Medio de pago</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Persona</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((expense) => {
                const category = categories.find((c) => c.id === expense.categoryId);
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(expense.spentAt)}</TableCell>
                    <TableCell>
                      <span className="font-medium">{expense.description}</span>
                      {expense.expenseType === "guilty_pleasure" && (
                        <Badge variant="secondary" className="ml-2 text-xs">{EXPENSE_TYPE_LABELS.guilty_pleasure}</Badge>
                      )}
                      {expense.merchant && <p className="text-xs text-muted-foreground">{expense.merchant}</p>}
                    </TableCell>
                    <TableCell>
                      <CurrencyDisplay amount={expense.amount} currency={expense.currency} amountInPEN={expense.amountInPen} othersShare={expense.othersShare} />
                    </TableCell>
                    <TableCell className="text-sm">{methodName(expense.paymentMethodId)}</TableCell>
                    <TableCell className="text-sm">{category?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm">{personName(expense.personId)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteExpense.mutate(expense.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export const DailyExpenseTable = withQuery(DailyExpenseTableView);
