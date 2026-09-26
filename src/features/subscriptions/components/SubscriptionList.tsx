import { useState } from "react";
import { OwnPart } from "@/shared/components/OwnPart";
import { totalsOf } from "@/shared/lib/shared-expense";
import { nameById, usePeople, useMe } from "@/shared/api/hooks/catalogs";
import { useDeleteExpense, useExpenses, useSaveExpense, type SubscriptionGroup } from "@/shared/api/hooks/expenses";
import { MoveSeriesDialog, type MoveSource } from "@/shared/components/MoveSeriesDialog";
import { RowActions } from "@/shared/components/RowActions";
import { duplicateBody, nextMonthBody } from "@/shared/lib/expense-actions";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES, type Subscription } from "@/shared/api/types";
import { SUBSCRIPTION_KIND_LABELS, SUBSCRIPTION_PERIOD_LABELS as PERIOD_LABELS } from "@/shared/labels";
import { usePeriod } from "@/shared/stores/period.store";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { EmptyState } from "@/shared/components/EmptyState";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Plus } from "lucide-react";
import { SubscriptionDialog } from "./SubscriptionDialog";
import { DataView, useViewMode, ViewToggle, type Column } from "@/shared/components/DataView";
import { ExpenseFilters } from "@/shared/components/ExpenseFilters";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { applyExpenseFilters, type ExpenseFilterKey, type ExpenseFilterValues } from "@/shared/lib/expense-filters";
import { SUBSCRIPTION_STATUSES } from "@/shared/labels";
import { useNewExpense } from "@/shared/stores/new-expense.store";

const FILTERS: ExpenseFilterKey[] = ["person", "q", "status", "period", "shared"];

const PERIOD_COLORS: Record<string, string> = {
  biweekly: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  monthly: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  quarterly: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  semiannual: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  annual: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

// Plataformas (platform) and Recurrentes (service, annual, other) are the same table split by kind (D107)
const TEXTS: Record<SubscriptionGroup, { name: string; count: string; add: string; empty: string; none: string }> = {
  platform: {
    name: "Plataforma",
    count: "plataformas activas",
    add: "Nueva plataforma",
    empty: "No hay plataformas con estos filtros",
    none: "No hay plataformas registradas",
  },
  recurring: {
    name: "Recurrente",
    count: "recurrentes",
    add: "Nuevo recurrente",
    empty: "No hay recurrentes con estos filtros",
    none: "No hay recurrentes este mes: pásalos desde Costos fijos o Plataformas con «Pasar a…»",
  },
};

function SubscriptionListView({ group = "platform" }: { group?: SubscriptionGroup }) {
  const texts = TEXTS[group];
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const all = useExpenses(EXPENSE_RESOURCES.subscription, { month: selectedMonth, year: selectedYear }, group).data ?? [];
  const [moving, setMoving] = useState<MoveSource | null>(null);
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(FILTERS);
  const me = useMe();
  const current = applyExpenseFilters(all, filters, me);
  const openNewExpense = useNewExpense((state) => state.openWith);
  const newPlatform = () =>
    openNewExpense({ destination: "subscription", period: "monthly", kind: group === "recurring" ? "service" : null });
  const personName = nameById(usePeople().data);
  const deleteSubscription = useDeleteExpense(EXPENSE_RESOURCES.subscription);
  const saveSubscription = useSaveExpense(EXPENSE_RESOURCES.subscription);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | undefined>();

  const totals = totalsOf(current);
  const [view, setView] = useViewMode(group === "recurring" ? "recurring" : "subscriptions", group === "recurring" ? "table" : "cards");

  const columns: Column<Subscription>[] = [
    { key: "description", header: texts.name, role: "title", cell: (sub) => <span className="font-medium">{sub.description}</span> },
    ...(group === "recurring"
      ? ([
          { key: "kind", header: "Tipo", cell: (sub) => <Badge variant="outline">{SUBSCRIPTION_KIND_LABELS[sub.kind] ?? sub.kind}</Badge> },
          { key: "supplyNumber", header: "N.º de suministro", cell: (sub) => <span className="text-sm tabular-nums">{sub.supplyNumber ?? "—"}</span> },
        ] satisfies Column<Subscription>[])
      : []),
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      cell: (sub) => <CurrencyDisplay amount={sub.amount} currency={sub.currency} amountInPEN={sub.amountInPen} othersShare={sub.othersShare} />,
    },
    { key: "period", header: "Periodo", cell: (sub) => <Badge className={PERIOD_COLORS[sub.period]}>{PERIOD_LABELS[sub.period]}</Badge> },
    { key: "status", header: "Estado", cell: (sub) => <StatusBadge status={sub.paymentStatus} /> },
    { key: "person", header: "Persona", cell: (sub) => <span className="text-sm">{personName(sub.personId)}</span> },
    { key: "notes", header: "Nota", cell: (sub) => <span className="text-xs text-muted-foreground">{sub.notes ?? "—"}</span> },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[50px]",
      cell: (sub) => (
        <RowActions
          label={sub.description}
          files={{ refType: "expense", refId: sub.id }}
          onEdit={() => { setEditingSub(sub); setDialogOpen(true); }}
          onDuplicate={() => saveSubscription.mutate({ body: duplicateBody(EXPENSE_RESOURCES.subscription, sub) })}
          onNextMonth={() => saveSubscription.mutate({ id: sub.id, body: nextMonthBody(sub) })}
          onMove={() => setMoving({ resource: EXPENSE_RESOURCES.subscription, id: sub.id, description: sub.description, kind: sub.kind })}
          onDelete={() => deleteSubscription.mutate(sub.id)}
          status={{
            value: sub.paymentStatus,
            options: SUBSCRIPTION_STATUSES,
            onChange: (paymentStatus) => saveSubscription.mutate({ id: sub.id, body: { paymentStatus } }),
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{current.length} {texts.count}</p>
          <p className="text-2xl font-bold">S/ {totals.paid.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/mes</span></p>
          <OwnPart {...totals} />
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <Button size="sm" onClick={newPlatform}>
            <Plus className="mr-1 h-4 w-4" /> {texts.add}
          </Button>
        </div>
      </div>

      <ExpenseFilters
        fields={FILTERS}
        value={filters}
        onChange={setFilters}
        statuses={SUBSCRIPTION_STATUSES}
        shown={current.length}
        total={all.length}
      />

      {current.length === 0 ? (
        <EmptyState description={all.length ? texts.empty : texts.none} />
      ) : (
        <DataView
          items={current}
          columns={columns}
          rowKey={(sub) => sub.id}
          view={view}
          extraCard={
            <button
              type="button"
              onClick={newPlatform}
              className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground hover:bg-muted/50"
            >
              <Plus className="h-5 w-5" /> {texts.add}
            </button>
          }
        />
      )}

      <SubscriptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subscription={editingSub}
      />

      {moving && <MoveSeriesDialog key={moving.id} source={moving} onClose={() => setMoving(null)} />}
    </div>
  );
}

export const SubscriptionList = withQuery(SubscriptionListView);
