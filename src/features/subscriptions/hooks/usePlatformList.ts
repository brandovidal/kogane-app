import { useEffect, useMemo } from "react";
import { nameById, useMe, usePaymentMethods, usePeople } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { applyExpenseFilters } from "@/features/expenses/lib/expense-filters";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { EXPENSE_RESOURCES, type Subscription } from "@/shared/api/types";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { usePeriod } from "@/shared/stores/period.store";
import { platformHeaderStore } from "../stores/platform-header.store";
import { PLATFORM_FILTER_KEYS } from "../constants/platforms";
import type { PlatformView } from "../sections/list/PlatformViewBar";

const EMPTY: Subscription[] = [];

export function usePlatformList() {
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const query = useExpenses(EXPENSE_RESOURCES.subscription, { month, year }, "platform");
  const items = query.data ?? EMPTY;
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(PLATFORM_FILTER_KEYS);
  const [groupParams, setGroupParams] = useUrlFilters<{ group?: string }>(["group"]);
  const [viewParams, setViewParams] = useUrlFilters<{ vista?: string }>(["vista"]);
  const view: PlatformView = viewParams.vista === "cards" || viewParams.vista === "period" || viewParams.vista === "calendar" ? viewParams.vista : "list";
  const setView = (next: PlatformView) => setViewParams(next === "list" ? {} : { vista: next });
  const me = useMe();
  const people = usePeople().data;
  const personName = nameById(people);
  const paymentMethods = usePaymentMethods().data;
  const accountName = nameById(paymentMethods);
  const personCounts = useMemo(
    () =>
      items.reduce<Record<string, number>>((counts, item) => {
        const id = item.personId ?? "__unassigned__";
        counts[id] = (counts[id] ?? 0) + 1;
        return counts;
      }, {}),
    [items],
  );
  const filtered = useMemo(
    () => {
      const matches = applyExpenseFilters(items, filters, me);
      if (!filters.methodType) return matches;
      const methodTypes = new Map(
        (paymentMethods ?? []).map((method) => [method.id, method.type]),
      );
      return matches.filter(
        (item) =>
          item.paymentMethodId != null &&
          methodTypes.get(item.paymentMethodId) === filters.methodType,
      );
    },
    [items, filters, me, paymentMethods],
  );
  const groupBy = (groupParams.group?.split(",") ?? []).filter(
    (field): field is "person" | "period" => field === "person" || field === "period",
  );
  const setGroupBy = (next: Array<"person" | "period">) =>
    setGroupParams(next.length ? { group: next.join(",") } : {});

  useEffect(() => {
    platformHeaderStore.getState().setCount(query.isLoading ? null : items.length);
  }, [items.length, query.isLoading]);

  return {
    items,
    filtered,
    filters,
    setFilters,
    groupBy,
    setGroupBy,
    view,
    setView,
    month,
    year,
    me,
    personName,
    accountName,
    personCounts,
    loading: query.isLoading,
    error: query.isError,
    resetKey: JSON.stringify([month, year, filters, groupBy]),
  };
}
