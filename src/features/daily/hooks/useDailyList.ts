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

import { DAILY_FILTERS } from "../constants/daily";
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
  const [today, setToday] = useState<Date | null>(null);
  const [hideEmpty, setHideEmpty] = useHideEmptyGroups("daily");

  useEffect(() => setToday(new Date()), []);

  const sorted = useMemo(
    () =>
      applyExpenseFilters(expenses, filters, me).sort((left, right) =>
        right.spentAt.localeCompare(left.spentAt),
      ),
    [expenses, filters, me],
  );

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
    layout,
    setLayout,
    today,
    hideEmpty,
    setHideEmpty,
    sorted,
  };
}
