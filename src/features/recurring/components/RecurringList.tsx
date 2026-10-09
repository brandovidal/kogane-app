import { useEffect, useMemo, useState } from "react";
import { nameById, usePeople } from "@/shared/api/hooks/catalogs";
import {
  useDeleteExpense,
  useExpenses,
  useSaveExpense,
} from "@/features/expenses/hooks/expenses";
import { useGenerateRecurring } from "@/features/recurring/hooks/recurring";
import { usePeriod } from "@/shared/stores/period.store";
import { toast } from "sonner";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES, type RecurringExpense } from "@/shared/api/types";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { IndicatorsDisclosure } from "@/shared/components/data-display/IndicatorsDisclosure";
import { IndicatorsCollapsedSummary } from "@/shared/components/data-display/IndicatorsCollapsedSummary";
import { GroupedDataView } from "@/shared/components/data-display/GroupedDataView";
import { NameAvatar } from "@/shared/components/data-display/NameAvatar";
import { ViewModeToggle } from "@/shared/components/toolbar/ViewModeToggle";
import { GroupingMenu } from "@/shared/components/toolbar/GroupingMenu";
import { FilterSelect } from "@/shared/components/filters/FilterSelect";
import { ExpenseFilters } from "@/features/expenses/components/filters/ExpenseFilters";
import { RowActions } from "@/features/expenses/components/RowActions";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { applyExpenseFilters } from "@/features/expenses/lib/expense-filters";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { EXPENSE_TYPE_LABELS } from "@/shared/constants/finance";
import { SUBSCRIPTION_PERIOD_LABELS } from "@/features/subscriptions/constants/subscriptions";
import type { Column } from "@/shared/types/data-view";
import { useMe } from "@/shared/api/hooks/catalogs";
import { RecurringDialog } from "./RecurringDialog";
import { Button } from "@/ui/button";
import { Switch } from "@/ui/switch";
import { CalendarPlus, Copy, Download, Plus, Trash2 } from "lucide-react";
import { duplicateBody } from "@/features/expenses/lib/expense-actions";
import { BulkActionsToolbar } from "@/shared/components/toolbar/BulkActionsToolbar";
import { DeleteConfirmationDialog } from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { useCsvExport } from "@/shared/hooks/useCsvExport";
import { SlidersHorizontal } from "lucide-react";
import type { ColumnVisibilityOption } from "@/shared/components/toolbar";
import {
  countActiveExpenseFilters,
  PERSON_ALL,
} from "@/features/expenses/lib/expense-filters";
import { RecurringViewSettings } from "./RecurringViewSettings";
import {
  AppliedFilterChips,
  type AppliedFilterChip,
} from "@/shared/components/filters/AppliedFilterChips";
import { AppliedViewSummary } from "@/shared/components/toolbar/AppliedViewSummary";
import { AppliedGroupChips } from "@/shared/components/toolbar/AppliedGroupChips";
import { AppliedSortChip } from "@/shared/components/toolbar/AppliedSortChip";

const FILTER_KEYS = [
  "q",
  "person",
  "currency",
  "type",
  "method",
  "period",
  "status",
] as const;
const TEMPLATE_FILTER_FIELDS = [
  "person",
  "q",
  "currency",
  "type",
  "method",
  "period",
] as const;
type RecurringGroupBy = "origin" | "period" | "person" | "currency" | "active";
const GROUP_OPTIONS: { value: RecurringGroupBy; label: string }[] = [
  { value: "origin", label: "Origen" },
  { value: "period", label: "Frecuencia" },
  { value: "person", label: "Persona" },
  { value: "currency", label: "Moneda" },
  { value: "active", label: "Estado" },
];
const SORT_OPTIONS = [
  { value: "day", label: "Día de cobro", descending: false },
  { value: "name", label: "Nombre", descending: false },
  { value: "amount", label: "Monto", descending: true },
  { value: "period", label: "Frecuencia", descending: false },
] as const;
const PERIOD_MONTHS: Record<string, number> = {
  biweekly: 0.5,
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
};
const originLabel = (target: string) =>
  target === "fixed_cost"
    ? "Costos fijos"
    : target === "subscription"
      ? "Plataformas"
      : "Tarjetas";
const nextGenerationDate = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
};
const nativeTotals = (items: RecurringExpense[]) =>
  items.reduce(
    (totals, item) => {
      const currency = item.currency === "USD" ? "USD" : "PEN";
      totals[currency] += item.amount;
      return totals;
    },
    { PEN: 0, USD: 0 },
  );
const formatTotals = (totals: { PEN: number; USD: number }) =>
  [
    totals.PEN > 0 && formatCurrency(totals.PEN, "PEN"),
    totals.USD > 0 && formatCurrency(totals.USD, "USD"),
  ]
    .filter(Boolean)
    .join(" + ") || "S/ 0.00";

function RecurringListView() {
  const { data: recurring = [], isLoading } = useExpenses(
    EXPENSE_RESOURCES.recurring,
  );
  const personName = nameById(usePeople().data);
  const me = useMe();
  const saveRecurring = useSaveExpense(EXPENSE_RESOURCES.recurring);
  const deleteRecurring = useDeleteExpense(EXPENSE_RESOURCES.recurring);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringExpense>();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    () => new Set(),
  );
  const [showSubtotals, setShowSubtotals] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState(false);
  const [showCount, setShowCount] = useState(true);
  const [showSum, setShowSum] = useState(true);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(FILTER_KEYS);
  const [originFilters, setOriginFilters] = useUrlFilters<{ origin?: string }>([
    "origin",
  ]);
  const [groupParams, setGroupParams] = useUrlFilters<{ group?: string }>([
    "group",
  ]);
  const [sortParams, setSortParams] = useUrlFilters<{ sort?: string }>([
    "sort",
  ]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sort = SORT_OPTIONS.some((option) => option.value === sortParams.sort)
    ? sortParams.sort!
    : "day";
  const groupBy = (groupParams.group?.split(",") ?? []).filter(
    (field): field is RecurringGroupBy =>
      GROUP_OPTIONS.some((option) => option.value === field),
  );
  const setGroupBy = (next: RecurringGroupBy[]) =>
    setGroupParams(next.length ? { group: next.join(",") } : {});
  const [view, setView] = useViewMode("recurring-templates", "table");
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const generate = useGenerateRecurring();
  const filtered = useMemo(() => {
    const { status, ...expenseFilters } = filters;
    const visible = applyExpenseFilters(recurring, expenseFilters, me);
    return visible
      .filter(
        (item) =>
          !originFilters.origin || item.targetType === originFilters.origin,
      )
      .filter((item) =>
        status === "active"
          ? item.isActive
          : status === "paused"
            ? !item.isActive
            : true,
      )
      .sort((left, right) => {
        if (sort === "name")
          return left.description.localeCompare(right.description);
        if (sort === "amount") return right.amount - left.amount;
        if (sort === "period")
          return (left.period ?? "").localeCompare(right.period ?? "");
        return left.dayOfMonth - right.dayOfMonth;
      });
  }, [recurring, filters, originFilters.origin, me, sort]);
  const active = recurring.filter((item) => item.isActive);
  const monthly = active.reduce(
    (sum, item) => {
      const currency = item.currency === "USD" ? "USD" : "PEN";
      sum[currency] += item.amount / (PERIOD_MONTHS[item.period] ?? 1);
      return sum;
    },
    { PEN: 0, USD: 0 },
  );
  const annual = { PEN: monthly.PEN * 12, USD: monthly.USD * 12 };
  const nextDate = active
    .map((item) => nextGenerationDate(year, month, item.dayOfMonth))
    .sort()[0];
  const nextCount = active.filter(
    (item) => nextGenerationDate(year, month, item.dayOfMonth) === nextDate,
  ).length;
  const totals = nativeTotals(filtered);
  const selectedItems = filtered.filter((item) => selected.has(item.id));
  const selectedActive =
    selectedItems.length > 0 && selectedItems.every((item) => item.isActive);
  useEffect(() => {
    const ids = new Set(recurring.map((item) => item.id));
    setSelected((current) => new Set([...current].filter((id) => ids.has(id))));
  }, [recurring]);
  const csv = useCsvExport({
    filename: `recurrentes-plantillas-${year}-${String(month).padStart(2, "0")}`,
    headers: [
      "Plantilla",
      "Origen",
      "Monto",
      "Moneda",
      "Frecuencia",
      "Persona",
      "Día de cobro",
      "Activa",
    ],
    rows: selectedItems.map((item) => [
      item.description,
      originLabel(item.targetType),
      String(item.amount),
      item.currency,
      item.period,
      personName(item.personId),
      String(item.dayOfMonth),
      item.isActive ? "Sí" : "No",
    ]),
  });

  const generateMonth = () =>
    generate.mutate(
      { month, year },
      {
        onSuccess: ({ created, skipped }) => {
          const missing = skipped.filter(
            (item) =>
              item.reason === "missing_card" ||
              item.reason === "missing_category",
          ).length;
          toast.success(
            created.length
              ? `${created.length} gastos creados como pendientes en ${getMonthName(month)}`
              : `${getMonthName(month)} ya estaba generado`,
            missing
              ? {
                  description: `${missing} sin tarjeta o categoría: complétalos para generarlos.`,
                }
              : undefined,
          );
        },
      },
    );
  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const columns: Column<RecurringExpense>[] = [
    {
      key: "description",
      header: "Plantilla",
      role: "title",
      accessor: (item) => item.description,
      cell: (item) => (
        <span className="inline-flex items-center gap-3 font-semibold">
          <NameAvatar name={item.description} />
          <span>{item.description}</span>
        </span>
      ),
    },
    {
      key: "origin",
      header: "Origen",
      accessor: (item) => originLabel(item.targetType),
      cell: (item) => originLabel(item.targetType),
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      accessor: (item) => item.amount,
      cell: (item) => formatCurrency(item.amount, item.currency),
    },
    {
      key: "period",
      header: "Frecuencia",
      accessor: (item) => item.period,
      cell: (item) => SUBSCRIPTION_PERIOD_LABELS[item.period] ?? "Mensual",
    },
    {
      key: "person",
      header: "Persona",
      accessor: (item) => personName(item.personId),
      cell: (item) => {
        const name = personName(item.personId);
        return (
          <span className="inline-flex items-center gap-2">
            <NameAvatar name={name} />
            {name}
          </span>
        );
      },
    },
    {
      key: "nextGeneration",
      header: "Próxima generación",
      accessor: (item) => nextGenerationDate(year, month, item.dayOfMonth),
      cell: (item) => (
        <span className="flex flex-col tabular-nums">
          <span>
            {new Intl.DateTimeFormat("es-PE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              timeZone: "UTC",
            }).format(
              new Date(nextGenerationDate(year, month, item.dayOfMonth)),
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            Cobro día {String(item.dayOfMonth).padStart(2, "0")}
          </span>
        </span>
      ),
    },
    {
      key: "active",
      header: "Activa",
      accessor: (item) => (item.isActive ? "Activa" : "Pausada"),
      cell: (item) => (
        <Switch
          checked={item.isActive}
          onCheckedChange={(checked) =>
            saveRecurring.mutate({
              id: item.id,
              body: { isActive: checked },
            })
          }
          aria-label={`${item.isActive ? "Pausar" : "Activar"} ${item.description}`}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-12",
      cell: (item) => (
        <RowActions
          label={item.description}
          files={{ refType: "expense", refId: item.id }}
          history={{ entity: "exp_recurring_expenses", id: item.id }}
          onEdit={() => {
            setEditing(item);
            setDialogOpen(true);
          }}
          onDuplicate={() =>
            saveRecurring.mutate({
              body: duplicateBody(EXPENSE_RESOURCES.recurring, item),
            })
          }
          onDelete={() => deleteRecurring.mutateAsync(item.id)}
        />
      ),
    },
  ];
  const settingsColumns = columns.filter((column) => column.key !== "actions");
  const columnVisibilityOptions: ColumnVisibilityOption[] = settingsColumns.map(
    (column) => ({
      id: column.key,
      label: column.header,
      visible: !hiddenColumns.has(column.key),
      disabled: column.key === "description",
      onVisibleChange: (visible) =>
        setHiddenColumns((current) => {
          const next = new Set(current);
          if (visible) next.delete(column.key);
          else next.add(column.key);
          return next;
        }),
    }),
  );
  const visibleColumnCount = columnVisibilityOptions.filter(
    (column) => column.visible,
  ).length;
  const visibleColumns = columns.filter(
    (column) => !hiddenColumns.has(column.key),
  );
  const filterCount = countActiveExpenseFilters(filters, FILTER_KEYS);
  const canResetView =
    filterCount > 0 ||
    !!originFilters.origin ||
    groupBy.length > 0 ||
    sort !== "day" ||
    hiddenColumns.size > 0 ||
    !showSubtotals ||
    collapsedGroups ||
    !showCount ||
    !showSum;
  const resetView = () => {
    setFilters({});
    setOriginFilters({});
    setGroupBy([]);
    setSortParams({});
    setHiddenColumns(new Set());
    setShowSubtotals(true);
    setCollapsedGroups(false);
    setShowCount(true);
    setShowSum(true);
  };
  const footer = (showCount || showSum) && (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      {showCount ? (
        <span>
          COUNT <strong className="text-foreground">{filtered.length}</strong>
        </span>
      ) : (
        <span />
      )}
      {showSum && (
        <span>
          SUM{" "}
          <strong className="text-foreground">{formatTotals(totals)}</strong>
        </span>
      )}
    </div>
  );
  const appliedFilters: AppliedFilterChip[] = [
    filters.currency && {
      key: "currency",
      label: `Moneda: ${filters.currency
        .split(",")
        .map((currency) =>
          currency === "USD" ? "Dólares (USD)" : "Soles (PEN)",
        )
        .join(", ")}`,
      onRemove: () => setFilters({ ...filters, currency: undefined }),
    },
    filters.period && {
      key: "period",
      label: `Frecuencia: ${filters.period
        .split(",")
        .map((period) => SUBSCRIPTION_PERIOD_LABELS[period] ?? period)
        .join(", ")}`,
      onRemove: () => setFilters({ ...filters, period: undefined }),
    },
    filters.type && {
      key: "type",
      label: `Tipo de gasto: ${filters.type
        .split(",")
        .map((type) => EXPENSE_TYPE_LABELS[type] ?? type)
        .join(", ")}`,
      onRemove: () => setFilters({ ...filters, type: undefined }),
    },
    filters.method && {
      key: "method",
      label: `Medio de pago: ${filters.method}`,
      onRemove: () => setFilters({ ...filters, method: undefined }),
    },
    filters.status && {
      key: "status",
      label: `Estado: ${filters.status === "active" ? "Activa" : "Pausada"}`,
      onRemove: () => setFilters({ ...filters, status: undefined }),
    },
    filters.person
      ?.split(",")
      .some((person) => person && person !== PERSON_ALL) && {
      key: "person",
      label: `Persona: ${filters.person
        .split(",")
        .filter((person) => person && person !== PERSON_ALL)
        .map((person) => personName(person))
        .join(", ")}`,
      onRemove: () => setFilters({ ...filters, person: undefined }),
    },
    originFilters.origin && {
      key: "origin",
      label: `Origen: ${originLabel(originFilters.origin)}`,
      onRemove: () => setOriginFilters({}),
    },
    filters.q?.trim()
      ? {
          key: "q",
          label: `Buscar: ${filters.q.trim()}`,
          onRemove: () => setFilters({ ...filters, q: undefined }),
        }
      : undefined,
  ].filter((item): item is AppliedFilterChip => !!item);
  const appliedSummary =
    appliedFilters.length > 0 || groupBy.length > 0 || sort !== "day" ? (
      <AppliedViewSummary
        onAddFilter={() => setFiltersOpen(true)}
        onReset={resetView}
        resetDisabled={!canResetView}
      >
        <span className="eyebrow shrink-0">Filtros</span>
        <AppliedFilterChips items={appliedFilters} tone="brand" />
        <AppliedGroupChips
          value={groupBy}
          options={GROUP_OPTIONS}
          onChange={setGroupBy}
        />
        {sort !== "day" && (
          <AppliedSortChip
            label={
              SORT_OPTIONS.find((option) => option.value === sort)?.label ??
              sort
            }
            descending={
              SORT_OPTIONS.find((option) => option.value === sort)
                ?.descending ?? false
            }
            onRemove={() => setSortParams({})}
          />
        )}
      </AppliedViewSummary>
    ) : undefined;

  const metric = (
    label: string,
    value: string,
    detail: string,
    activeCard = false,
  ) => (
    <div
      className={`min-w-0 rounded-xl border border-border/80 bg-card px-4 py-3.5 ${activeCard ? "bg-brand/5 ring-2 ring-brand/30" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="eyebrow truncate">{label}</div>
        {activeCard && (
          <span className="text-xs font-medium text-brand">Mostrando</span>
        )}
      </div>
      <div className="mt-1 truncate text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1 truncate text-xs text-muted-foreground">
        {detail}
      </div>
    </div>
  );

  if (isLoading) return null;
  return (
    <div className="space-y-4">
      <IndicatorsDisclosure
        ariaLabel="indicadores de plantillas"
        defaultOpen
        summary={`${recurring.length} plantillas · ${formatTotals(monthly)} al mes`}
        collapsedContent={
          <IndicatorsCollapsedSummary
            summary={`${recurring.length} plantillas`}
            metrics={[
              { label: "Plantillas", value: String(recurring.length) },
              { label: "Costo mensual", value: formatTotals(monthly) },
              { label: "Costo anual", value: formatTotals(annual) },
              {
                label: "Próxima generación",
                value: nextDate ?? "Sin cobros",
              },
            ]}
          />
        }
      >
        <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {metric(
            "Plantillas",
            String(recurring.length),
            `${active.length} activas · ${recurring.length - active.length} pausadas`,
            true,
          )}
          {metric(
            "Costo mensual",
            formatTotals(monthly),
            "de plantillas activas",
          )}
          {metric(
            "Costo anual",
            formatTotals(annual),
            "12 meses al ritmo actual",
          )}
          {metric(
            "Próxima generación",
            nextDate ?? "—",
            `${nextCount} recurrentes nuevos`,
          )}
        </section>
      </IndicatorsDisclosure>

      <div>
        <ExpenseFilters
          fields={[...TEMPLATE_FILTER_FIELDS]}
          value={filters}
          onChange={setFilters}
          shown={filtered.length}
          total={recurring.length}
          description={`${filtered.length} de ${recurring.length} plantillas coinciden con estos filtros.`}
          filterOpen={filtersOpen}
          onFilterOpenChange={setFiltersOpen}
          activeMarkers
          extraFilterCount={
            Number(!!filters.status) + Number(!!originFilters.origin)
          }
          onClearFilters={() => {
            setFilters({});
            setOriginFilters({});
          }}
          panelExtraFields={
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FilterSelect
                label="Origen"
                value={originFilters.origin}
                onChange={(origin) => setOriginFilters({ origin })}
                options={[
                  { value: "fixed_cost", label: "Costos fijos" },
                  { value: "subscription", label: "Plataformas" },
                  { value: "credit_card", label: "Tarjetas" },
                ]}
                width="w-full"
                allLabel="Todos los orígenes"
              />
              <FilterSelect
                label="Estado"
                value={filters.status}
                onChange={(status) => setFilters({ ...filters, status })}
                options={[
                  { value: "active", label: "Activa" },
                  { value: "paused", label: "Pausada" },
                ]}
                width="w-full"
                allLabel="Todos los estados"
              />
            </div>
          }
          rightActions={
            <>
              <GroupingMenu
                value={groupBy}
                onChange={setGroupBy}
                options={GROUP_OPTIONS}
                multiple
                ordered
                maxSelected={2}
              />
              <RecurringViewSettings
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Ajustes de vista"
                    title="Ajustes de vista"
                  >
                    <SlidersHorizontal className="size-4" />
                  </Button>
                }
                view={view}
                onViewChange={setView}
                columns={columnVisibilityOptions}
                visibleColumnCount={visibleColumnCount}
                groupBy={groupBy}
                groupOptions={GROUP_OPTIONS}
                sort={sort}
                sortOptions={SORT_OPTIONS}
                onSortChange={(next) =>
                  setSortParams(next === "day" ? {} : { sort: next })
                }
                onGroupByChange={(next) =>
                  setGroupBy(
                    next.filter((field): field is RecurringGroupBy =>
                      GROUP_OPTIONS.some((option) => option.value === field),
                    ),
                  )
                }
                subtotals={showSubtotals}
                onSubtotalsChange={setShowSubtotals}
                showCount={showCount}
                onShowCountChange={setShowCount}
                showSum={showSum}
                onShowSumChange={setShowSum}
                collapsedGroups={collapsedGroups}
                onCollapsedGroupsChange={setCollapsedGroups}
                onOpenFilters={() => setFiltersOpen(true)}
                filterCount={filterCount + Number(!!originFilters.origin)}
                canReset={canResetView}
                onReset={resetView}
              />
              <ViewModeToggle value={view} onChange={setView} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateMonth}
                disabled={generate.isPending}
              >
                <CalendarPlus className="size-4" />
                <span className="hidden sm:inline">Generar este mes</span>
              </Button>
              <Button type="button" size="sm" onClick={openCreate}>
                <Plus className="size-4" /> Nueva plantilla
              </Button>
            </>
          }
          appliedFilters={appliedSummary}
        />
      </div>

      {!filtered.length ? (
        <EmptyState
          variant={recurring.length ? "filters" : "empty"}
          title={recurring.length ? "Sin resultados" : "Aún no hay plantillas"}
          description={
            recurring.length
              ? "Prueba con otros filtros."
              : "Crea una plantilla para generar recurrentes automáticamente."
          }
          action={
            !recurring.length && (
              <Button type="button" size="sm" onClick={openCreate}>
                Nueva plantilla
              </Button>
            )
          }
        />
      ) : (
        <GroupedDataView
          items={filtered}
          columns={visibleColumns}
          rowKey={(item) => item.id}
          view={view}
          groupBy={groupBy}
          groupKey={(item, field) => {
            if (field === "origin") return item.targetType;
            if (field === "person") return item.personId ?? "none";
            if (field === "currency") return item.currency;
            if (field === "active") return item.isActive ? "active" : "paused";
            return item.period ?? "monthly";
          }}
          groupLabel={(key, field) => {
            if (field === "origin") return originLabel(key);
            if (field === "person")
              return key === "none" ? "Sin persona" : personName(key);
            if (field === "currency")
              return key === "USD" ? "Dólares (USD)" : "Soles (PEN)";
            if (field === "active")
              return key === "active" ? "Activas" : "Pausadas";
            return SUBSCRIPTION_PERIOD_LABELS[key] ?? key;
          }}
          summaryForGroup={
            showSubtotals
              ? (items) => ({
                  label: `${items.length} ${items.length === 1 ? "plantilla" : "plantillas"} · ${formatTotals(nativeTotals(items))}`,
                })
              : undefined
          }
          footer={footer}
          collapsiblePrimaryGroups={collapsedGroups}
          initialOpenPrimaryGroups={
            collapsedGroups ? 0 : Number.MAX_SAFE_INTEGER
          }
          selected={selected}
          onSelectedChange={setSelected}
          tableClassName="recurring-templates-table"
        />
      )}

      <BulkActionsToolbar
        count={selectedItems.length}
        onClear={() => setSelected(new Set())}
      >
        <span className="text-xs text-muted-foreground">
          {formatTotals(nativeTotals(selectedItems))}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            selectedItems.forEach((item) =>
              saveRecurring.mutate({
                id: item.id,
                body: { isActive: !selectedActive },
              }),
            );
            setSelected(new Set());
          }}
        >
          {selectedActive ? "Pausar plantillas" : "Activar plantillas"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            selectedItems.forEach((item) =>
              saveRecurring.mutate({
                body: duplicateBody(EXPENSE_RESOURCES.recurring, item),
              }),
            )
          }
        >
          <Copy className="size-4" /> Duplicar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={csv.exportCsv}>
          <Download className="size-4" /> Exportar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => setDeleteSelectedOpen(true)}
        >
          <Trash2 className="size-4" /> Eliminar
        </Button>
      </BulkActionsToolbar>

      <DeleteConfirmationDialog
        open={deleteSelectedOpen}
        onOpenChange={setDeleteSelectedOpen}
        title={`¿Eliminar ${selectedItems.length} ${selectedItems.length === 1 ? "plantilla" : "plantillas"}?`}
        description="Se eliminarán las plantillas seleccionadas. Los registros ya generados no cambian."
        onConfirm={() => {
          selectedItems.forEach((item) => deleteRecurring.mutate(item.id));
          setSelected(new Set());
          setDeleteSelectedOpen(false);
        }}
      />

      <RecurringDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        recurring={editing}
      />
    </div>
  );
}

export const RecurringList = withQuery(RecurringListView);
