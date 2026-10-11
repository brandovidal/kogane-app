import { useEffect, useMemo, useState } from "react";

import {
  nameById,
  useCategories,
  useMe,
  usePaymentMethods,
  usePeople,
} from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { applyExpenseFilters } from "@/features/expenses/lib/expense-filters";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { useHideEmptyGroups } from "@/shared/hooks/useHideEmptyGroups";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { useUrlPeriod } from "@/shared/hooks/useUrlPeriod";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { usePeriod } from "@/shared/stores/period.store";

import { DAILY_FILTERS, type DailySort } from "../constants/daily";
import type { DailyLayout } from "../types/daily-types";

export function useDailyList() {
  useUrlPeriod();
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const query = useExpenses(EXPENSE_RESOURCES.daily, { month, year });
  const expenses = useMemo(() => query.data ?? [], [query.data]);
  const people = usePeople().data ?? [];
  const categories = useCategories().data ?? [];
  const personName = nameById(people);
  const methodName = nameById(usePaymentMethods().data);
  const categoryName = nameById(categories);
  const me = useMe();
  const [filters, setFilters] =
    useUrlFilters<ExpenseFilterValues>(DAILY_FILTERS);
  const [view, setView] = useViewMode("daily", "table");
  const [groupBy, setGroupBy] = useState("none");
  const [layout, setLayout] = useState<DailyLayout>("list");
  const [sort, setSort] = useState<DailySort>("date-desc");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [today, setToday] = useState<Date | null>(null);
  const [hideEmpty, setHideEmpty] = useHideEmptyGroups("daily");

  useEffect(() => setToday(new Date()), []);

  const selectionScope = `${layout}:${groupBy}:${JSON.stringify(filters)}`;
  useEffect(() => setSelected(new Set()), [selectionScope]);

  const sorted = useMemo(() => {
    const direction = sort.endsWith("asc") ? 1 : -1;
    return applyExpenseFilters(expenses, filters, me).sort((left, right) => {
      if (sort.startsWith("date"))
        return direction * left.spentAt.localeCompare(right.spentAt);
      if (sort.startsWith("amount"))
        return (
          direction *
          ((left.amountInPen ?? left.amount) -
            (right.amountInPen ?? right.amount))
        );
      return left.description.localeCompare(right.description);
    });
  }, [expenses, filters, me, sort]);

  return {
    month,
    year,
    expenses,
    isLoading: query.isLoading,
    people,
    categories,
    personName,
    methodName,
    categoryName,
    me,
    filters,
    setFilters,
    view,
    setView,
    groupBy,
    setGroupBy,
    sort,
    setSort,
    layout,
    setLayout,
    selected,
    setSelected,
    today,
    hideEmpty,
    setHideEmpty,
    sorted,
  };
}
