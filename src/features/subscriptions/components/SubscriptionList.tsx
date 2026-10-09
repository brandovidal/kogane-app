import { useState } from "react";
import { OwnPart } from "@/features/expenses/components/OwnPart";
import { totalsOf } from "@/features/expenses/lib/shared-expense";
import { nameById, usePeople, useMe } from "@/shared/api/hooks/catalogs";
import {
  useDeleteExpense,
  useExpenses,
  useSaveExpense,
  type SubscriptionGroup,
} from "@/features/expenses/hooks/expenses";
import {
  MoveSeriesDialog,
  type MoveSource,
} from "@/features/expenses/components/dialogs/MoveSeriesDialog";
import { RowActions } from "@/features/expenses/components/RowActions";
import {
  duplicateBody,
  nextMonthBody,
} from "@/features/expenses/lib/expense-actions";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES, type Subscription } from "@/shared/api/types";
import { SUBSCRIPTION_PERIOD_LABELS as PERIOD_LABELS } from "@/features/subscriptions/constants/subscriptions";
import { usePeriod } from "@/shared/stores/period.store";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { CurrencyDisplay } from "@/features/expenses/components/CurrencyDisplay";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Plus } from "lucide-react";
import { SubscriptionDialog } from "./SubscriptionDialog";
import { GroupedDataView } from "@/shared/components/data-display/GroupedDataView";
import { IndicatorsDisclosure } from "@/shared/components/data-display/IndicatorsDisclosure";
import { IndicatorsCollapsedSummary } from "@/shared/components/data-display/IndicatorsCollapsedSummary";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { ViewToggle } from "@/shared/components/data-display/ViewToggle";
import { type Column } from "@/shared/types/data-view";
import { ExpenseFilters } from "@/features/expenses/components/filters/ExpenseFilters";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { applyExpenseFilters } from "@/features/expenses/lib/expense-filters";
import type {
  ExpenseFilterKey,
  ExpenseFilterValues,
} from "@/features/expenses/types/expense-filters";
import { SUBSCRIPTION_STATUSES } from "@/features/subscriptions/constants/subscriptions";
import { useNewExpense } from "@/features/new-expense/stores/new-expense.store";
import { isPaidStatus } from "@/features/expenses/lib/expense-actions";
import {
  formatPlatformCurrency,
  formatPlatformTotals,
  sumPlatformAmounts,
} from "@/features/subscriptions/lib/platform-summary";
import { formatDate, localTodayKey } from "@/shared/lib/dates";
import { daysUntilDue } from "@/features/fixed-costs/lib/fixed-cost-summary";
import { relativeDueLabel } from "@/features/fixed-costs/lib/fixed-cost-views";

const FILTERS: ExpenseFilterKey[] = [
  "person",
  "q",
  "status",
  "period",
  "currency",
  "shared",
];
const RECURRING_FILTERS: ExpenseFilterKey[] = [
  "person",
  "q",
  "status",
  "period",
  "currency",
  "shared",
  "type",
  "category",
  "method",
  "hasNote",
  "amountFrom",
  "amountTo",
  "dueFrom",
  "dueTo",
];

const PERIOD_COLORS: Record<string, string> = {
  biweekly:
    "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  monthly: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  quarterly:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  semiannual: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  annual: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const TEXTS: Record<
  SubscriptionGroup,
  { name: string; count: string; add: string; empty: string; none: string }
> = {
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

function SubscriptionListView({
  group = "platform",
  onCreateRecurringTemplate,
}: {
  group?: SubscriptionGroup;
  onCreateRecurringTemplate?: () => void;
}) {
  const texts = TEXTS[group];
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const all =
    useExpenses(
      EXPENSE_RESOURCES.subscription,
      { month: selectedMonth, year: selectedYear },
      group,
    ).data ?? [];
  const [moving, setMoving] = useState<MoveSource | null>(null);
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(
    group === "recurring" ? RECURRING_FILTERS : FILTERS,
  );
  const me = useMe();
  const current = applyExpenseFilters(all, filters, me);
  const openNewExpense = useNewExpense((state) => state.openWith);
  const newPlatform = () => {
    if (group === "recurring" && onCreateRecurringTemplate) {
      onCreateRecurringTemplate();
      return;
    }
    openNewExpense({
      destination: "subscription",
      period: "monthly",
      kind: group === "recurring" ? "service" : null,
    });
  };
  const personName = nameById(usePeople().data);
  const deleteSubscription = useDeleteExpense(EXPENSE_RESOURCES.subscription);
  const saveSubscription = useSaveExpense(EXPENSE_RESOURCES.subscription);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | undefined>();

  const totals = totalsOf(current);
  const recurrentPending = current.filter(
    (item) => !isPaidStatus(item.paymentStatus),
  );
  const recurrentPaid = current.filter((item) =>
    isPaidStatus(item.paymentStatus),
  );
  const recurrentPendingTotals = sumPlatformAmounts(recurrentPending);
  const recurrentPaidTotals = sumPlatformAmounts(recurrentPaid);
  const recurrentTotals = sumPlatformAmounts(current);
  const todayKey = localTodayKey();
  const nextRecurring = [...current]
    .filter(
      (item) =>
        item.dueDate &&
        item.dueDate.slice(0, 10) >= todayKey &&
        !isPaidStatus(item.paymentStatus),
    )
    .sort((left, right) =>
      (left.dueDate ?? "").localeCompare(right.dueDate ?? ""),
    )[0];
  const paidPercent = recurrentTotals.PEN
    ? Math.round(((recurrentPaidTotals.PEN ?? 0) / recurrentTotals.PEN) * 100)
    : 0;
  const zeroTotals = (value: ReturnType<typeof sumPlatformAmounts>) =>
    formatPlatformTotals(value) === "—"
      ? "S/ 0.00"
      : formatPlatformTotals(value);
  const [view, setView] = useViewMode(
    group === "recurring" ? "recurring" : "subscriptions",
    group === "recurring" ? "table" : "cards",
  );
  const [groupBy, setGroupBy] = useState("none");

  const columns: Column<Subscription>[] = [
    {
      key: "description",
      header: texts.name,
      role: "title",
      cell: (sub) => <span className="font-medium">{sub.description}</span>,
    },
    ...(group === "recurring"
      ? ([
          {
            key: "origin",
            header: "Origen",
            cell: (sub) => (
              <Badge variant="secondary">
                {sub.kind === "platform" ? "Plataformas" : "Costos fijos"}
              </Badge>
            ),
          },
        ] satisfies Column<Subscription>[])
      : []),
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      cell: (sub) => (
        <CurrencyDisplay
          amount={sub.amount}
          currency={sub.currency}
          amountInPEN={sub.amountInPen}
          othersShare={sub.othersShare}
        />
      ),
    },
    {
      key: "period",
      header: "Periodo",
      cell: (sub) => (
        <Badge className={PERIOD_COLORS[sub.period]}>
          {PERIOD_LABELS[sub.period]}
        </Badge>
      ),
    },
    ...(group === "recurring"
      ? ([
          {
            key: "person",
            header: "Persona",
            cell: (sub) => (
              <span className="text-sm">{personName(sub.personId)}</span>
            ),
          },
          {
            key: "dueDate",
            header: "Fecha de cobro",
            accessor: (sub) => sub.dueDate ?? "",
            cell: (sub) => {
              if (!sub.dueDate)
                return <span className="text-muted-foreground">—</span>;
              const days = daysUntilDue(sub.dueDate, todayKey);
              return (
                <span className="flex flex-col text-sm tabular-nums">
                  <span>{formatDate(sub.dueDate)}</span>
                  {days !== null &&
                    days <= 30 &&
                    !isPaidStatus(sub.paymentStatus) && (
                      <span
                        className={
                          days < 0
                            ? "text-xs text-destructive"
                            : "text-xs text-amber-600 dark:text-amber-300"
                        }
                      >
                        {relativeDueLabel(days)}
                      </span>
                    )}
                </span>
              );
            },
          },
          {
            key: "status",
            header: "Estado",
            cell: (sub) => {
              const overdue =
                sub.dueDate != null &&
                sub.dueDate.slice(0, 10) < todayKey &&
                !isPaidStatus(sub.paymentStatus);
              return (
                <StatusBadge
                  status={overdue ? "late" : sub.paymentStatus}
                  label={overdue ? "Vencido" : undefined}
                />
              );
            },
          },
        ] satisfies Column<Subscription>[])
      : ([
          {
            key: "status",
            header: "Estado",
            cell: (sub) => <StatusBadge status={sub.paymentStatus} />,
          },
          {
            key: "person",
            header: "Persona",
            cell: (sub) => (
              <span className="text-sm">{personName(sub.personId)}</span>
            ),
          },
        ] satisfies Column<Subscription>[])),
    ...(group === "platform"
      ? ([
          {
            key: "notes",
            header: "Nota",
            cell: (sub) => (
              <span className="text-xs text-muted-foreground">
                {sub.notes ?? "—"}
              </span>
            ),
          },
        ] satisfies Column<Subscription>[])
      : []),
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[50px]",
      cell: (sub) => (
        <RowActions
          label={sub.description}
          files={{ refType: "expense", refId: sub.id }}
          history={{ entity: "exp_subscriptions", id: sub.id }}
          onEdit={() => {
            setEditingSub(sub);
            setDialogOpen(true);
          }}
          onDuplicate={() =>
            saveSubscription.mutate({
              body: duplicateBody(EXPENSE_RESOURCES.subscription, sub),
            })
          }
          onNextMonth={() =>
            saveSubscription.mutate({ id: sub.id, body: nextMonthBody(sub) })
          }
          onMove={() =>
            setMoving({
              resource: EXPENSE_RESOURCES.subscription,
              id: sub.id,
              description: sub.description,
              kind: sub.kind,
            })
          }
          onDelete={() => deleteSubscription.mutate(sub.id)}
          status={{
            value: sub.paymentStatus,
            options: SUBSCRIPTION_STATUSES,
            onChange: (paymentStatus) =>
              saveSubscription.mutate({ id: sub.id, body: { paymentStatus } }),
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {group === "recurring" ? (
        <IndicatorsDisclosure
          ariaLabel="indicadores de recurrentes"
          summary={`${zeroTotals(sumPlatformAmounts(current))} · ${current.length} recurrentes`}
          collapsedContent={
            <IndicatorsCollapsedSummary
              summary={`${current.length} recurrentes este mes`}
              metrics={[
                {
                  label: "Total recurrente",
                  value: zeroTotals(sumPlatformAmounts(current)),
                },
                {
                  label: "Por pagar",
                  value:
                    recurrentPending.length > 0
                      ? formatPlatformTotals(recurrentPendingTotals)
                      : "S/ 0.00",
                },
                {
                  label: "Pagado",
                  value:
                    recurrentPaid.length > 0
                      ? formatPlatformTotals(recurrentPaidTotals)
                      : "S/ 0.00",
                },
                {
                  label: "Próximo cobro",
                  value: nextRecurring?.description ?? "Sin cobros",
                },
              ]}
            />
          }
        >
          <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3.5 ring-1 ring-brand/20">
              <div className="flex items-center justify-between gap-2">
                <div className="eyebrow">Total recurrente</div>
                <span className="text-xs font-medium text-brand">
                  Mostrando
                </span>
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                {zeroTotals(sumPlatformAmounts(current))}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {current.length}{" "}
                {current.length === 1 ? "recurrente" : "recurrentes"} este mes
              </div>
            </div>
            <div className="rounded-xl border border-border/80 bg-card px-4 py-3.5">
              <div className="eyebrow flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-amber-400" /> Por
                pagar
              </div>
              <div className="mt-1 text-xl font-semibold tabular-nums text-amber-400">
                {formatPlatformTotals(recurrentPendingTotals)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {recurrentPending.length} pendientes
              </div>
            </div>
            <div className="rounded-xl border border-border/80 bg-card px-4 py-3.5">
              <div className="eyebrow flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400" /> Pagado
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-emerald-300">
                {recurrentPaid.length
                  ? formatPlatformTotals(recurrentPaidTotals)
                  : "S/ 0.00"}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/80">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-[width]"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {recurrentPaid.length} de {current.length} · {paidPercent}% del
                mes en S/
              </div>
            </div>
            <div className="rounded-xl border border-border/80 bg-card px-4 py-3.5">
              <div className="eyebrow flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-amber-400" /> Próximo
                cobro
              </div>
              <div className="mt-1 truncate text-xl font-semibold tracking-tight text-amber-300">
                {nextRecurring?.description ?? "—"}
                {nextRecurring?.dueDate && (
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    · {nextRecurring.dueDate.slice(8, 10)}/
                    {nextRecurring.dueDate.slice(5, 7)}
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {nextRecurring?.dueDate
                  ? `${formatPlatformCurrency(nextRecurring.amount, nextRecurring.currency)} · ${relativeDueLabel(daysUntilDue(nextRecurring.dueDate, todayKey))}`
                  : "Sin cobros"}
              </div>
            </div>
          </section>
        </IndicatorsDisclosure>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground">
            {current.length} {texts.count}
          </p>
          <p className="text-2xl font-bold">
            S/ {totals.paid.toFixed(2)}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              /mes
            </span>
          </p>
          <OwnPart {...totals} />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ExpenseFilters
          fields={group === "recurring" ? RECURRING_FILTERS : FILTERS}
          value={filters}
          onChange={setFilters}
          statuses={SUBSCRIPTION_STATUSES}
          shown={current.length}
          total={all.length}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          groupByOptions={
            group === "recurring"
              ? [
                  { value: "person", label: "Persona" },
                  { value: "period", label: "Frecuencia" },
                  { value: "status", label: "Estado" },
                  { value: "currency", label: "Moneda" },
                ]
              : [
                  { value: "person", label: "Por persona" },
                  { value: "period", label: "Por período" },
                ]
          }
        />
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ViewToggle value={view} onChange={setView} />
          <Button size="sm" onClick={newPlatform}>
            <Plus className="mr-1 h-4 w-4" /> {texts.add}
          </Button>
        </div>
      </div>

      {current.length === 0 ? (
        <EmptyState
          variant={all.length ? "filters" : "period"}
          title={all.length ? "Sin resultados" : "Sin recurrentes este mes"}
          description={
            all.length
              ? texts.empty
              : "Pásalos desde Costos fijos o Plataformas con «Pasar a recurrente» y se generarán cada período."
          }
          action={
            !all.length && group === "recurring" ? (
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href="/costos-fijos">Ir a Costos fijos</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/plataformas">Ir a Plataformas</a>
                </Button>
              </div>
            ) : undefined
          }
        />
      ) : (
        <GroupedDataView
          items={current}
          columns={columns}
          rowKey={(sub) => sub.id}
          view={view}
          groupBy={groupBy}
          groupKey={(row, key) => {
            if (key === "person") return row.personId ?? "none";
            if (key === "status") return row.paymentStatus;
            if (key === "currency") return row.currency;
            return row.period;
          }}
          groupLabel={(key, field) => {
            if (key === "none") return "Sin persona";
            if (field === "person") return personName(key);
            if (field === "status") return key;
            if (field === "currency")
              return key === "USD" ? "Dólares (USD)" : "Soles (PEN)";
            return PERIOD_LABELS[key] ?? key;
          }}
          footer={
            group === "recurring" ? (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  COUNT{" "}
                  <strong className="text-foreground">{current.length}</strong>
                </span>
                <span>
                  SUM{" "}
                  <strong className="text-foreground">
                    {formatPlatformTotals(sumPlatformAmounts(current))}
                  </strong>
                </span>
              </div>
            ) : undefined
          }
          extraCard={
            <button
              type="button"
              onClick={newPlatform}
              className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground hover:bg-muted/50"
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

export const SubscriptionList = withQuery(SubscriptionListView);
