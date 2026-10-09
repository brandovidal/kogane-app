import { useEffect, useMemo } from "react";
import {
  nameById,
  useMe,
  usePaymentMethods,
  usePeople,
} from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { applyExpenseFilters } from "@/features/expenses/lib/expense-filters";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { EXPENSE_RESOURCES, type Subscription } from "@/shared/api/types";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { usePeriod } from "@/shared/stores/period.store";
import { monthKeyIndex } from "@/features/fixed-costs/lib/fixed-cost-views";
import { platformHeaderStore } from "../stores/platform-header.store";
import { PLATFORM_FILTER_KEYS } from "../constants/platforms";
import type { PlatformView } from "../sections/list/PlatformViewBar";

const EMPTY: Subscription[] = [];
type ViewPeriod = {
  month?: string;
  year?: string;
  desde?: string;
  hasta?: string;
};
const VIEW_PERIOD_KEYS = ["month", "year", "desde", "hasta"] as const;
type LegacyPeriodFilters = Pick<
  ExpenseFilterValues,
  "period" | "dueFrom" | "dueTo"
>;

export function usePlatformList() {
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const setPeriod = usePeriod((state) => state.setPeriod);
  const [viewPeriod] = useUrlFilters<ViewPeriod>(VIEW_PERIOD_KEYS, {
    month: String(month),
    year: String(year),
  });
  const [legacyPeriodFilters, clearLegacyPeriodFilters] =
    useUrlFilters<LegacyPeriodFilters>(["period", "dueFrom", "dueTo"]);
  useEffect(() => {
    if (
      legacyPeriodFilters.period ||
      legacyPeriodFilters.dueFrom ||
      legacyPeriodFilters.dueTo
    ) {
      clearLegacyPeriodFilters({});
    }
  }, [clearLegacyPeriodFilters, legacyPeriodFilters]);
  const hasRange = !!(viewPeriod.desde || viewPeriod.hasta);
  const monthView = !hasRange && !!viewPeriod.month && !!viewPeriod.year;
  const query = useExpenses(
    EXPENSE_RESOURCES.subscription,
    monthView
      ? { month: Number(viewPeriod.month), year: Number(viewPeriod.year) }
      : undefined,
    "platform",
  );
  const sourceItems = query.data ?? EMPTY;
  const items = useMemo(() => {
    if (hasRange) {
      const from = monthKeyIndex(viewPeriod.desde);
      const to = monthKeyIndex(viewPeriod.hasta);
      return sourceItems.filter((item) => {
        const index = item.paymentYear * 12 + item.paymentMonth - 1;
        return (from == null || index >= from) && (to == null || index <= to);
      });
    }
    if (!viewPeriod.month && viewPeriod.year) {
      return sourceItems.filter(
        (item) => item.paymentYear === Number(viewPeriod.year),
      );
    }
    if (monthView) {
      return sourceItems.filter(
        (item) =>
          item.paymentMonth === Number(viewPeriod.month) &&
          item.paymentYear === Number(viewPeriod.year),
      );
    }
    return sourceItems;
  }, [sourceItems, hasRange, viewPeriod, monthView]);
  useEffect(() => {
    if (monthView) {
      setPeriod(Number(viewPeriod.month), Number(viewPeriod.year));
    } else if (!hasRange && !viewPeriod.month && viewPeriod.year) {
      setPeriod(1, Number(viewPeriod.year));
    }
  }, [hasRange, monthView, setPeriod, viewPeriod.month, viewPeriod.year]);
  const [filters, setFilters] =
    useUrlFilters<ExpenseFilterValues>(PLATFORM_FILTER_KEYS);
  const [groupParams, setGroupParams] = useUrlFilters<{ group?: string }>([
    "group",
  ]);
  const [viewParams, setViewParams] = useUrlFilters<{ vista?: string }>([
    "vista",
  ]);
  const view: PlatformView =
    viewParams.vista === "cards" ||
    viewParams.vista === "period" ||
    viewParams.vista === "calendar"
      ? viewParams.vista
      : "list";
  const setView = (next: PlatformView) =>
    setViewParams(next === "list" ? {} : { vista: next });
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
  const filtered = useMemo(() => {
    const matches = applyExpenseFilters(items, filters, me);
    if (!filters.methodType) return matches;
    const methodTypes = new Map(
      (paymentMethods ?? []).map((method) => [method.id, method.type]),
    );
    const selectedMethodTypes = filters.methodType.split(",").filter(Boolean);
    return matches.filter(
      (item) =>
        item.paymentMethodId != null &&
        selectedMethodTypes.includes(
          methodTypes.get(item.paymentMethodId) ?? "",
        ),
    );
  }, [items, filters, me, paymentMethods]);
  const groupBy = (groupParams.group?.split(",") ?? []).filter(
    (field): field is "person" | "period" =>
      field === "person" || field === "period",
  );
  const setGroupBy = (next: Array<"person" | "period">) =>
    setGroupParams(next.length ? { group: next.join(",") } : {});

  useEffect(() => {
    platformHeaderStore
      .getState()
      .setCount(query.isLoading ? null : items.length);
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
    resetKey: JSON.stringify([month, year, viewPeriod, filters, groupBy]),
  };
}
