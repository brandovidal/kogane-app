import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import {
  nameById,
  useCategories,
  useMe,
  usePaymentMethods,
  usePeople,
} from "@/shared/api/hooks/catalogs";
import {
  useDeleteExpense,
  useExpenses,
  useSaveExpense,
} from "@/features/expenses/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES, type DailyExpense } from "@/shared/api/types";
import { CurrencyDisplay } from "@/features/expenses/components/CurrencyDisplay";
import { GroupedDataView } from "@/shared/components/data-display/GroupedDataView";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { ViewToggle } from "@/shared/components/data-display/ViewToggle";
import { type Column } from "@/shared/types/data-view";
import { dayKey, dayLabel } from "../lib/day-label";
import { DailyIndicators } from "./DailyIndicators";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { ExpenseFilters } from "@/features/expenses/components/filters/ExpenseFilters";
import { RowActions } from "@/features/expenses/components/RowActions";
import { duplicateBody } from "@/features/expenses/lib/expense-actions";
import { ExpenseEditDialog } from "@/features/expenses/components/ExpenseEditDialog";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { EXPENSE_TYPE_LABELS } from "@/shared/constants/finance";
import { formatDate } from "@/shared/lib/dates";
import { applyExpenseFilters } from "@/features/expenses/lib/expense-filters";
import type {
  ExpenseFilterKey,
  ExpenseFilterValues,
} from "@/features/expenses/types/expense-filters";
import { useNewExpense } from "@/features/new-expense/stores/new-expense.store";
import { usePeriod } from "@/shared/stores/period.store";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { CategoryLabel } from "@/features/categories/components/CategoryLabel";

const FILTERS: ExpenseFilterKey[] = [
  "person",
  "q",
  "category",
  "method",
  "currency",
  "type",
  "shared",
];

// Día a día ("gastos sin culpa", exp_daily_expenses): what the bot saves most. New ones come from Nuevo gasto or the chat
function DailyExpenseTableView() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const { data: expenses = [], isLoading } = useExpenses(
    EXPENSE_RESOURCES.daily,
    { month, year },
  );
  const personName = nameById(usePeople().data);
  const methodName = nameById(usePaymentMethods().data);
  const categories = useCategories().data ?? [];
  const categoryName = nameById(categories);
  const deleteExpense = useDeleteExpense(EXPENSE_RESOURCES.daily);
  const saveExpense = useSaveExpense(EXPENSE_RESOURCES.daily);
  const [editing, setEditing] = useState<DailyExpense | undefined>();
  const openNewExpense = useNewExpense((state) => state.openWith);
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(FILTERS);
  const [view, setView] = useViewMode("daily", "table");
  const [groupBy, setGroupBy] = useState("none");
  // Hoy/Ayer depend on the browser clock: only after mount, so the server HTML matches
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  const me = useMe();

  const sorted = applyExpenseFilters(expenses, filters, me).sort((a, b) =>
    b.spentAt.localeCompare(a.spentAt),
  );

  const columns: Column<DailyExpense>[] = [
    {
      key: "date",
      header: "Fecha",
      cell: (e) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(e.spentAt)}
        </span>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      role: "title",
      cell: (e) => (
        <div>
          <span className="font-medium">{e.description}</span>
          {e.expenseType === "guilty_pleasure" && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {EXPENSE_TYPE_LABELS.guilty_pleasure}
            </Badge>
          )}
          {e.merchant && (
            <p className="text-xs text-muted-foreground">{e.merchant}</p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      cell: (e) => (
        <CurrencyDisplay
          amount={e.amount}
          currency={e.currency}
          amountInPEN={e.amountInPen}
          othersShare={e.othersShare}
        />
      ),
    },
    {
      key: "method",
      header: "Medio de pago",
      cell: (e) => (
        <span className="text-sm">{methodName(e.paymentMethodId)}</span>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      cell: (e) => {
        const category = categories.find((item) => item.id === e.categoryId);
        return category ? (
          <CategoryLabel
            name={category.name}
            icon={category.icon}
            color={category.color}
            className="text-sm"
          />
        ) : (
          "—"
        );
      },
    },
    {
      key: "person",
      header: "Persona",
      cell: (e) => <span className="text-sm">{personName(e.personId)}</span>,
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[50px]",
      cell: (e) => (
        <RowActions
          label={e.description}
          files={{ refType: "expense", refId: e.id }}
          history={{ entity: "exp_daily_expenses", id: e.id }}
          onEdit={() => setEditing(e)}
          onDuplicate={() =>
            saveExpense.mutate({
              body: duplicateBody(EXPENSE_RESOURCES.daily, e),
            })
          }
          onDelete={() => deleteExpense.mutate(e.id)}
        />
      ),
    },
  ];

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      <DailyIndicators expenses={sorted} month={month} year={year} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ExpenseFilters
          fields={FILTERS}
          value={filters}
          onChange={setFilters}
          shown={sorted.length}
          total={expenses.length}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          groupByOptions={[
            { value: "day", label: "Por día" },
            { value: "person", label: "Por persona" },
            { value: "category", label: "Por categoría" },
          ]}
        />
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ViewToggle value={view} onChange={setView} />
          <Button
            size="sm"
            onClick={() => openNewExpense({ destination: "daily" })}
          >
            <Plus className="mr-1 h-4 w-4" /> Nuevo gasto
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        expenses.length ? (
          <EmptyState
            variant="filters"
            title="Sin resultados"
            description="No hay gastos con estos filtros"
          />
        ) : (
          <EmptyState
            variant="period"
            title="Sin gastos este mes"
            description="Registra tu primer gasto o mándalo por Mensajes: una captura, un audio o un texto basta."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => openNewExpense({ destination: "daily" })}
                >
                  Nuevo gasto
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/mensajes">Ir a Mensajes</a>
                </Button>
              </div>
            }
          />
        )
      ) : (
        <GroupedDataView
          items={sorted}
          columns={columns}
          rowKey={(e) => e.id}
          view={view}
          groupBy={groupBy}
          groupKey={(e, key) =>
            key === "day"
              ? dayKey(e.spentAt)
              : key === "person"
                ? (e.personId ?? "none")
                : (e.categoryId ?? "none")
          }
          groupLabel={(key, field) =>
            field === "day"
              ? dayLabel(key, today)
              : key === "none"
                ? "Sin asignar"
                : field === "person"
                  ? personName(key)
                  : categoryName(key)
          }
        />
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
