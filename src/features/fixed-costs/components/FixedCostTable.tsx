import { useState } from "react";
import { OwnPart } from "@/shared/components/OwnPart";
import { totalsOf } from "@/shared/lib/shared-expense";
import { useCategories, usePaymentMethods, usePeople, nameById, useMe } from "@/shared/api/hooks/catalogs";
import { useDeleteExpense, useExpenses, useSaveExpense } from "@/shared/api/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES, type FixedCost } from "@/shared/api/types";
import { usePeriod } from "@/shared/stores/period.store";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/ui/select";
import { Plus } from "lucide-react";
import { RowActions } from "@/shared/components/RowActions";
import { MoveSeriesDialog, type MoveSource } from "@/shared/components/MoveSeriesDialog";
import { duplicateBody, nextMonthBody } from "@/shared/lib/expense-actions";
import { formatDate } from "@/shared/lib/dates";
import { FIXED_COST_STATUSES as PAYMENT_STATUSES, PAYMENT_STATUS_LABELS } from "@/shared/labels";
import { FixedCostDialog } from "./FixedCostDialog";
import { DataView, useViewMode, ViewToggle, type Column } from "@/shared/components/DataView";
import { ExpenseFilters } from "@/shared/components/ExpenseFilters";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { applyExpenseFilters, type ExpenseFilterKey, type ExpenseFilterValues } from "@/shared/lib/expense-filters";
import { useNewExpense } from "@/shared/stores/new-expense.store";

const FILTERS: ExpenseFilterKey[] = ["person", "q", "status", "category", "method", "type", "shared"];

function FixedCostTableView() {
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const fixedCosts =
    useExpenses(EXPENSE_RESOURCES.fixedCost, { month: selectedMonth, year: selectedYear }).data ?? [];
  const categories = useCategories().data ?? [];
  const people = usePeople().data ?? [];
  const personName = nameById(people);
  const accountName = nameById(usePaymentMethods().data);
  const saveFixedCost = useSaveExpense(EXPENSE_RESOURCES.fixedCost);
  const deleteFixedCost = useDeleteExpense(EXPENSE_RESOURCES.fixedCost);

  const openNewExpense = useNewExpense((state) => state.openWith);
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(FILTERS);
  const me = useMe();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedCost | undefined>();
  const [moving, setMoving] = useState<MoveSource | null>(null);

  const filtered = applyExpenseFilters(fixedCosts, filters, me);

  const totals = totalsOf(filtered);
  const [view, setView] = useViewMode("fixed-costs", "table");

  const columns: Column<FixedCost>[] = [
    {
      key: "description",
      header: "Descripción",
      role: "title",
      cell: (fc) => (
        <div>
          <span className="font-medium">{fc.description}</span>
          {fc.installment && <Badge variant="outline" className="ml-2 text-xs">{fc.installment}</Badge>}
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      cell: (fc) => {
        const cat = categories.find((c) => c.id === fc.categoryId);
        return cat ? (
          <span className="inline-flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
            {cat.name}
          </span>
        ) : (
          "—"
        );
      },
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      cell: (fc) => <CurrencyDisplay amount={fc.amount} currency={fc.currency} amountInPEN={fc.amountInPen} othersShare={fc.othersShare} />,
    },
    {
      key: "status",
      header: "Estado",
      cell: (fc) => (
        <Select value={fc.paymentStatus} onValueChange={(val) => saveFixedCost.mutate({ id: fc.id, body: { paymentStatus: val } })}>
          <SelectTrigger className="h-7 w-auto border-0 p-0">
            <StatusBadge status={fc.paymentStatus} />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>{PAYMENT_STATUS_LABELS[status]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    { key: "person", header: "Persona", cell: (fc) => <span className="text-sm">{personName(fc.personId)}</span> },
    {
      key: "due",
      header: "Vencimiento",
      cell: (fc) => <span className="text-sm text-muted-foreground">{fc.dueDate ? formatDate(fc.dueDate) : "—"}</span>,
    },
    { key: "account", header: "Cuenta", cell: (fc) => <span className="text-sm">{accountName(fc.paymentMethodId)}</span> },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[50px]",
      cell: (fc) => (
        <RowActions
          label={fc.description}
          onEdit={() => { setEditingItem(fc); setDialogOpen(true); }}
          onDuplicate={() => saveFixedCost.mutate({ body: duplicateBody(EXPENSE_RESOURCES.fixedCost, fc) })}
          onNextMonth={() => saveFixedCost.mutate({ id: fc.id, body: nextMonthBody(fc) })}
          onMove={() => setMoving({ resource: EXPENSE_RESOURCES.fixedCost, id: fc.id, description: fc.description })}
          onDelete={() => deleteFixedCost.mutate(fc.id)}
          status={{
            value: fc.paymentStatus,
            options: PAYMENT_STATUSES,
            onChange: (paymentStatus) => saveFixedCost.mutate({ id: fc.id, body: { paymentStatus } }),
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ExpenseFilters
          fields={FILTERS}
          value={filters}
          onChange={setFilters}
          statuses={PAYMENT_STATUSES}
          shown={filtered.length}
          total={fixedCosts.length}
        />
        <div className="flex shrink-0 items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <Button size="sm" onClick={() => openNewExpense({ destination: "fixed_cost" })}>
            <Plus className="mr-1 h-4 w-4" /> Nuevo gasto
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState description={fixedCosts.length ? "No hay costos fijos con estos filtros" : "No hay costos fijos en este mes"} />
      ) : (
        <DataView
          items={filtered}
          columns={columns}
          rowKey={(fc) => fc.id}
          view={view}
          footer={
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{filtered.length} registros</span>
              <div className="text-right">
                <span className="text-sm font-semibold">Total: S/ {totals.paid.toFixed(2)}</span>
                <OwnPart {...totals} />
              </div>
            </div>
          }
        />
      )}

      <FixedCostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fixedCost={editingItem}
      />

      {moving && <MoveSeriesDialog key={moving.id} source={moving} onClose={() => setMoving(null)} />}
    </div>
  );
}

export const FixedCostTable = withQuery(FixedCostTableView);
