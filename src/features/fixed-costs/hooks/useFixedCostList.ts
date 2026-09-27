import { useState } from "react";
import { nameById, useCategories, useMe, usePaymentMethods, usePeople } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { useCsvExport } from "@/shared/hooks/useCsvExport";
import { applyExpenseFilters, type ExpenseFilterValues } from "@/features/expenses/lib/expense-filters";
import { totalsOf } from "@/features/expenses/lib/shared-expense";
import { usePeriod } from "@/shared/stores/period.store";
import { buildFixedCostExport } from "@/features/fixed-costs/lib/fixed-cost-export";
import { FIXED_COST_FILTER_KEYS } from "@/features/fixed-costs/lib/fixed-cost-filters";
import type { FixedCostGroupBy } from "@/features/fixed-costs/types/fixed-cost-types";

export function useFixedCostList() {
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(FIXED_COST_FILTER_KEYS);
  const hasDueDateRange = !!(filters.dueFrom || filters.dueTo);
  const fixedCosts = useExpenses(
    EXPENSE_RESOURCES.fixedCost,
    hasDueDateRange ? undefined : { month, year },
  ).data ?? [];
  const categories = useCategories().data ?? [];
  const personName = nameById(usePeople().data);
  const accountName = nameById(usePaymentMethods().data);
  const me = useMe();
  const filtered = applyExpenseFilters(fixedCosts, filters, me);
  const [view, setView] = useViewMode("fixed-costs", "table");
  const [groupBy, setGroupBy] = useState<FixedCostGroupBy>("none");
  const csvExport = useCsvExport(buildFixedCostExport({
    items: filtered, categories, personName, accountName, filters, month, year,
  }));

  return {
    fixedCosts, categories, personName, accountName, me,
    filters, setFilters, filtered, view, setView, groupBy, setGroupBy,
    totals: totalsOf(filtered),
    exportItems: csvExport.items,
  };
}
