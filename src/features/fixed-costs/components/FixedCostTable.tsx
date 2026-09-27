import { useState } from "react";
import { OwnPart } from "@/shared/components/OwnPart";
import { totalsOf } from "@/shared/lib/shared-expense";
import {
  useCategories,
  usePaymentMethods,
  usePeople,
  nameById,
  useMe,
} from "@/shared/api/hooks/catalogs";
import {
  useDeleteExpense,
  useExpenses,
  useSaveExpense,
} from "@/shared/api/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES, type FixedCost } from "@/shared/api/types";
import { usePeriod } from "@/shared/stores/period.store";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/ui/select";
import { ArrowUpRight, FileSpreadsheet, FileText, Plus } from "lucide-react";
import { RowActions } from "@/shared/components/RowActions";
import {
  MoveSeriesDialog,
  type MoveSource,
} from "@/shared/components/MoveSeriesDialog";
import { duplicateBody, nextMonthBody } from "@/shared/lib/expense-actions";
import { formatDate } from "@/shared/lib/dates";
import {
  FIXED_COST_STATUSES as PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
} from "@/shared/labels";
import { FixedCostDialog } from "./FixedCostDialog";
import { FixedCostDetail } from "./FixedCostDetail";
import {
  GroupedDataView,
  useViewMode,
  ViewToggle,
  type Column,
} from "@/shared/components/DataView";
import { ExpenseFilters } from "@/shared/components/ExpenseFilters";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import {
  applyExpenseFilters,
  type ExpenseFilterKey,
  type ExpenseFilterValues,
} from "@/shared/lib/expense-filters";
import { useNewExpense } from "@/shared/stores/new-expense.store";
import { ActiveExpenseFilterChips } from "@/shared/components/ActiveExpenseFilterChips";
import { ExportMenu } from "@/shared/components/ExportMenu";
import { downloadCsv } from "@/shared/lib/export-csv";
import { EXPENSE_TYPE_LABELS } from "@/shared/labels";
import { CategoryLabel } from "@/shared/components/CategoryIcon";

const FILTERS: ExpenseFilterKey[] = [
  "person",
  "q",
  "status",
  "category",
  "method",
  "currency",
  "type",
  "shared",
];

function FixedCostTableView() {
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const fixedCosts =
    useExpenses(EXPENSE_RESOURCES.fixedCost, {
      month: selectedMonth,
      year: selectedYear,
    }).data ?? [];
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
  const [openedItem, setOpenedItem] = useState<FixedCost | undefined>();
  const [moving, setMoving] = useState<MoveSource | null>(null);

  const filtered = applyExpenseFilters(fixedCosts, filters, me);

  const totals = totalsOf(filtered);
  const [view, setView] = useViewMode("fixed-costs", "table");
  const [groupBy, setGroupBy] = useState("none");
  const groupLabel = groupBy === "none" ? "" : groupBy === "person" ? "Por persona" : "Por categoría";

  const csvHeaders = ["Descripción", "Categoría", "Monto", "Moneda", "Estado", "Tipo", "Persona", "Vencimiento", "Cuenta", "Cuota"];
  const csvRows = filtered.map((fc) => [
    fc.description,
    categories.find((category) => category.id === fc.categoryId)?.name ?? "",
    fc.amount,
    fc.currency,
    PAYMENT_STATUS_LABELS[fc.paymentStatus] ?? fc.paymentStatus,
    EXPENSE_TYPE_LABELS[fc.expenseType] ?? fc.expenseType,
    personName(fc.personId),
    fc.dueDate ? formatDate(fc.dueDate) : "",
    accountName(fc.paymentMethodId),
    fc.installment ?? "",
  ]);
  const exportFileName = `costos-fijos-${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const exportActions = (
    <>
      <ExportMenu items={[
        { label: "Exportar para Excel (.csv)", icon: <FileSpreadsheet />, onSelect: () => downloadCsv(`${exportFileName}-excel.csv`, csvHeaders, csvRows, { delimiter: ";" }) },
        { label: "Exportar CSV", icon: <FileText />, onSelect: () => downloadCsv(`${exportFileName}.csv`, csvHeaders, csvRows) },
      ]} />
      <Button size="sm" className="h-9" onClick={() => openNewExpense({ destination: "fixed_cost" })}>
        <Plus className="mr-1 h-4 w-4" /> Nuevo gasto
      </Button>
    </>
  );

  const columns: Column<FixedCost>[] = [
    {
      key: "description",
      header: "Descripción",
      role: "title",
      cell: (fc) => (
        <div>
          <button
            type="button"
            className="group inline-flex items-center gap-1 text-left font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Ver detalle de ${fc.description}`}
            onClick={() => setOpenedItem(fc)}
          >
            {fc.description}
            <ArrowUpRight aria-hidden="true" className="size-3.5 opacity-0 transition-opacity group-hover:opacity-70 group-focus-visible:opacity-70" />
          </button>
          {fc.installment && (
            <Badge variant="outline" className="ml-2 text-xs">
              {fc.installment}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      cell: (fc) => {
        const cat = categories.find((c) => c.id === fc.categoryId);
        return cat ? (
          <CategoryLabel name={cat.name} icon={cat.icon} color={cat.color} className="text-sm" />
        ) : (
          "—"
        );
      },
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      cell: (fc) => (
        <CurrencyDisplay
          amount={fc.amount}
          currency={fc.currency}
          amountInPEN={fc.amountInPen}
          othersShare={fc.othersShare}
        />
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (fc) => (
        <Select
          value={fc.paymentStatus}
          onValueChange={(val) =>
            saveFixedCost.mutate({ id: fc.id, body: { paymentStatus: val } })
          }
        >
          <SelectTrigger className="h-7 w-auto border-0 p-0">
            <StatusBadge status={fc.paymentStatus} />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                <StatusBadge status={status} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "person",
      header: "Persona",
      cell: (fc) => <span className="text-sm">{personName(fc.personId)}</span>,
    },
    {
      key: "due",
      header: "Vencimiento",
      cell: (fc) => (
        <span className="text-sm text-muted-foreground">
          {fc.dueDate ? formatDate(fc.dueDate) : "—"}
        </span>
      ),
    },
    {
      key: "account",
      header: "Cuenta",
      cell: (fc) => (
        <span className="text-sm">{accountName(fc.paymentMethodId)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[50px]",
      cell: (fc) => (
        <RowActions
          label={fc.description}
          files={{ refType: "fixed_cost", refId: fc.id }}
          history={{ entity: "exp_fixed_costs", id: fc.id }}
          onEdit={() => {
            setEditingItem(fc);
            setDialogOpen(true);
          }}
          onDuplicate={() =>
            saveFixedCost.mutate({
              body: duplicateBody(EXPENSE_RESOURCES.fixedCost, fc),
            })
          }
          onNextMonth={() =>
            saveFixedCost.mutate({ id: fc.id, body: nextMonthBody(fc) })
          }
          onMove={() =>
            setMoving({
              resource: EXPENSE_RESOURCES.fixedCost,
              id: fc.id,
              description: fc.description,
            })
          }
          onDelete={() => deleteFixedCost.mutate(fc.id)}
          status={{
            value: fc.paymentStatus,
            options: PAYMENT_STATUSES,
            onChange: (paymentStatus) =>
              saveFixedCost.mutate({ id: fc.id, body: { paymentStatus } }),
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <ExpenseFilters
          fields={FILTERS}
          value={filters}
          onChange={setFilters}
          statuses={PAYMENT_STATUSES}
          personInPanel
          description="Filtra por persona, categoría, medio de pago, moneda, estado, tipo o costos compartidos."
          fieldDescriptions={{
            person: "Elige una persona o muestra los costos de todos.",
            category: "Muestra solo los costos de una categoría.",
            method: "Filtra por la cuenta o medio de pago utilizado.",
            currency: "Limita los resultados a una moneda.",
            status: "Separa costos pendientes, pagados u otros estados.",
            type: "Distingue entre gastos necesarios y gustos.",
            shared: "Muestra costos compartidos o solo los tuyos.",
          }}
          countLabel="costos fijos"
          rightActions={exportActions}
          appliedFilters={
            <ActiveExpenseFilterChips
              fields={FILTERS}
              value={filters}
              onChange={setFilters}
              me={me}
              groupBy={groupBy}
              onGroupByChange={setGroupBy}
              groupByLabel={groupLabel}
            />
          }
          viewToggle={<ViewToggle value={view} onChange={setView} />}
          showActiveSummary={false}
          shown={filtered.length}
          total={fixedCosts.length}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          groupByOptions={[
            { value: "person", label: "Por persona" },
            { value: "category", label: "Por categoría" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          description={
            fixedCosts.length
              ? "No hay costos fijos con estos filtros"
              : "No hay costos fijos en este mes"
          }
        />
      ) : (
        <GroupedDataView
          items={filtered}
          columns={columns}
          rowKey={(fc) => fc.id}
          view={view}
          groupBy={groupBy}
          groupKey={(row, key) =>
            key === "person"
              ? (row.personId ?? "none")
              : (row.categoryId ?? "none")
          }
          groupLabel={(key, field) =>
            key === "none"
              ? "Sin asignar"
              : field === "person"
                ? personName(key)
                : (categories.find((category) => category.id === key)?.name ??
                  "Sin categoría")
          }
          footer={
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {filtered.length} registros
              </span>
              <div className="text-right">
                <span className="text-sm font-semibold">
                  Total: S/ {totals.paid.toFixed(2)}
                </span>
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

      <FixedCostDetail
        fixedCost={openedItem}
        categoryName={categories.find((category) => category.id === openedItem?.categoryId)?.name ?? "Sin categoría"}
        personName={personName(openedItem?.personId)}
        accountName={accountName(openedItem?.paymentMethodId)}
        onClose={() => setOpenedItem(undefined)}
        onEdit={() => {
          if (!openedItem) return;
          setEditingItem(openedItem);
          setOpenedItem(undefined);
          setDialogOpen(true);
        }}
      />

      {moving && (
        <MoveSeriesDialog
          key={moving.id}
          source={moving}
          onClose={() => setMoving(null)}
        />
      )}
    </div>
  );
}

export const FixedCostTable = withQuery(FixedCostTableView);
