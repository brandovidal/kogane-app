import { useMemo } from "react";
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

const EMPTY_COSTS: FixedCost[] = [];

export function useFixedCostList() {
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(
    FIXED_COST_FILTER_KEYS,
    { month: String(getCurrentMonth()), year: String(getCurrentYear()) },
  );
  const month = Number(filters.month);
  const year = Number(filters.year);
  const hasPeriod =
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12 &&
    Number.isInteger(year) &&
    year >= 1 &&
    year <= 9999;
  const query = useExpenses(
    EXPENSE_RESOURCES.fixedCost,
    hasPeriod ? { month, year } : undefined,
  );
  const fixedCosts = query.data ?? EMPTY_COSTS;
  const categories = useCategories().data ?? [];
  const personName = nameById(usePeople().data);
  const accountName = nameById(usePaymentMethods().data);
  const me = useMe();
  const filtered = useMemo(
    () => applyExpenseFilters(fixedCosts, filters, me),
    [fixedCosts, filters, me],
  );
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
    categories,
    personName,
    accountName,
    me,
    filters,
    setFilters,
    filtered,
    view,
    setView,
    groupBy,
    setGroupBy,
    exportItems: csvExport.items,
    loading: query.isLoading,
    error: query.isError,
    scopeKey: JSON.stringify(filters),
  };
}
