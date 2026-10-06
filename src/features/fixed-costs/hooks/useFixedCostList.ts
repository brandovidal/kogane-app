import { useEffect, useMemo } from "react";
import {
  nameById,
  useCategories,
  useMe,
  usePaymentMethods,
  usePeople,
} from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { EXPENSE_RESOURCES, type FixedCost } from "@/shared/api/types";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { useCsvExport } from "@/shared/hooks/useCsvExport";
import { applyExpenseFilters } from "@/features/expenses/lib/expense-filters";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { getCurrentMonth, getCurrentYear } from "@/shared/lib/dates";
import { buildFixedCostExport } from "@/features/fixed-costs/lib/fixed-cost-export";
import { FIXED_COST_FILTER_KEYS } from "@/features/fixed-costs/lib/fixed-cost-filters";
import { FIXED_COST_GROUP_VALUES } from "../constants/grouping";
import {
  filterFixedCostsByScope,
  type FixedCostStatusScope,
} from "../lib/fixed-cost-summary";
import {
  FIXED_COST_VIEW_PERIOD,
  costMonthIndex,
  filterByMonthRange,
  findFixedCostSort,
  isFixedCostView,
  installmentSeries,
  localTodayKey,
  payableByUrgency,
  type FixedCostView,
} from "../lib/fixed-cost-views";
import { fixedCostHeaderStore } from "../stores/fixed-cost-header.store";

const EMPTY_COSTS: FixedCost[] = [];

export function useFixedCostList() {
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(
    FIXED_COST_FILTER_KEYS,
    { month: String(getCurrentMonth()), year: String(getCurrentYear()) },
  );
  const [viewParams, setViewParams] = useUrlFilters<{
    vista?: string;
    orden?: string;
    desde?: string;
    hasta?: string;
  }>(["vista", "orden", "desde", "hasta"]);
  const page: FixedCostView = isFixedCostView(viewParams.vista) ? viewParams.vista : "mes";
  const setPage = (next: FixedCostView) =>
    setViewParams({ ...viewParams, vista: next === "mes" ? undefined : next });
  const sort = findFixedCostSort(viewParams.orden);
  const setSort = (next: string | undefined) => setViewParams({ ...viewParams, orden: next });
  const periodScope = FIXED_COST_VIEW_PERIOD[page];
  const hasRange = !!(viewParams.desde || viewParams.hasta);
  const month = Number(filters.month);
  const year = Number(filters.year);
  const hasPeriod =
    periodScope === "month" &&
    !hasRange &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12 &&
    Number.isInteger(year) &&
    year >= 1 &&
    year <= 9999;
  // One-month views request just that month; year, range and all-period modes load the data they need locally.
  const query = useExpenses(
    EXPENSE_RESOURCES.fixedCost,
    hasPeriod ? { month, year } : undefined,
  );
  const fixedCosts = query.data ?? EMPTY_COSTS;
  const previousMonthIndex = year * 12 + month - 2;
  const shouldLoadPreviousMonth =
    page === "mes" &&
    hasPeriod &&
    query.isSuccess &&
    fixedCosts.length === 0;
  const previousMonthQuery = useExpenses(
    EXPENSE_RESOURCES.fixedCost,
    shouldLoadPreviousMonth
      ? {
          month: (previousMonthIndex % 12) + 1,
          year: Math.floor(previousMonthIndex / 12),
        }
      : undefined,
    undefined,
    shouldLoadPreviousMonth,
  );
  const periodRecords = useMemo(() => {
    if (hasRange)
      return filterByMonthRange(fixedCosts, viewParams.desde, viewParams.hasta);
    if (periodScope === "year") {
      const selectedYear = Number(filters.year) || getCurrentYear();
      return fixedCosts.filter((cost) => cost.paymentYear === selectedYear);
    }
    return fixedCosts;
  }, [fixedCosts, hasRange, periodScope, filters.year, viewParams.desde, viewParams.hasta]);
  const periodFilters = useMemo<ExpenseFilterValues>(() => {
    if (hasRange) return { ...filters, month: undefined, year: undefined };
    if (periodScope === "year")
      return { ...filters, month: undefined, year: filters.year || String(getCurrentYear()) };
    return filters;
  }, [filters, periodScope, hasRange]);
  const categories = useCategories().data ?? [];
  const personName = nameById(usePeople().data);
  const accountName = nameById(usePaymentMethods().data);
  const me = useMe();
  const baseFiltered = useMemo(
    () =>
      filterByMonthRange(
        applyExpenseFilters(fixedCosts, periodFilters, me),
        hasRange ? viewParams.desde : undefined,
        hasRange ? viewParams.hasta : undefined,
      ),
    [fixedCosts, periodFilters, me, hasRange, viewParams.desde, viewParams.hasta],
  );
  const [scopeParams, setScopeParams] = useUrlFilters<{ scope?: FixedCostStatusScope }>(["scope"]);
  const scope: FixedCostStatusScope =
    scopeParams.scope === "payable" || scopeParams.scope === "completed"
      ? scopeParams.scope
      : "all";
  const setScope = (next: FixedCostStatusScope) =>
    setScopeParams(next === "all" ? {} : { scope: next });
  const filtered = useMemo(
    () =>
      page === "por-pagar"
        ? payableByUrgency(baseFiltered, localTodayKey())
        : page === "todos"
          ? [...filterFixedCostsByScope(baseFiltered, scope)].sort(
              (a, b) => costMonthIndex(b) - costMonthIndex(a),
            )
          : filterFixedCostsByScope(baseFiltered, scope),
    [baseFiltered, scope, page],
  );
  const installments = useMemo(() => installmentSeries(baseFiltered), [baseFiltered]);
  useEffect(() => {
    fixedCostHeaderStore.getState().setShown(
      query.isLoading ? null : page === "cuotas" ? installments.length : filtered.length,
      page === "cuotas" ? "deuda" : page === "por-pagar" ? "pendiente" : "registro",
    );
  }, [filtered.length, installments.length, query.isLoading, page]);
  const [view, setView] = useViewMode("fixed-costs", "table");
  const [groupParams, setGroupParams] = useUrlFilters<{ group?: string }>(["group"]);
  const groupBy = (groupParams.group?.split(",") ?? []).filter(
    (field, index, fields): field is (typeof FIXED_COST_GROUP_VALUES)[number] =>
      FIXED_COST_GROUP_VALUES.includes(field as (typeof FIXED_COST_GROUP_VALUES)[number]) &&
      fields.indexOf(field) === index,
  );
  const setGroupBy = (fields: typeof groupBy) => {
    const next = fields.filter(
      (field, index) =>
        FIXED_COST_GROUP_VALUES.includes(field) && fields.indexOf(field) === index,
    );
    setGroupParams(next.length ? { group: next.join(",") } : {});
  };
  const csvExport = useCsvExport(
    buildFixedCostExport({
      items: filtered,
      categories,
      personName,
      accountName,
      filters,
    }),
  );

  return {
    fixedCosts,
    periodRecords,
    previousMonthCosts: previousMonthQuery.data ?? EMPTY_COSTS,
    previousMonthLoading: previousMonthQuery.isLoading,
    categories,
    personName,
    accountName,
    me,
    filters,
    setFilters,
    filtered,
    installments,
    baseFiltered,
    page,
    setPage,
    sort,
    setSort,
    periodScope,
    scope,
    setScope,
    view,
    setView,
    groupBy,
    setGroupBy,
    exportItems: csvExport.items,
    loading: query.isLoading,
    error: query.isError,
    scopeKey: JSON.stringify([filters, scope, page, viewParams.desde, viewParams.hasta]),
  };
}
