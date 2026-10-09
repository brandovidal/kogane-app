import { Trash2 } from "lucide-react";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { FilterSheetShell } from "@/shared/components/filters/FilterSheetShell";
import { Button } from "@/ui/button";
import { SheetDescription, SheetTitle } from "@/ui/sheet";
import { FixedCostPeriodSelector } from "@/features/fixed-costs/components/header/FixedCostPeriodSelector";
import { getMonthName } from "@/shared/lib/dates";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { usePeriod } from "@/shared/stores/period.store";
import { monthRangeLabel } from "@/features/fixed-costs/lib/fixed-cost-views";
import { PLATFORM_FILTER_KEYS } from "../../constants/platforms";
import { SUBSCRIPTION_STATUSES } from "../../constants/subscriptions";
import { countPlatformFilters } from "../../lib/platform-filters";
import { PlatformFilterFields } from "./PlatformFilterFields";

const PLATFORM_SHEET_FILTER_KEYS = PLATFORM_FILTER_KEYS.filter(
  (key) => key !== "q",
);

type ViewPeriod = {
  month?: string;
  year?: string;
  desde?: string;
  hasta?: string;
};
const VIEW_PERIOD_KEYS = ["month", "year", "desde", "hasta"] as const;

export function PlatformFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  me,
  resultCount,
  totalCount,
  personCounts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  me?: string;
  resultCount: number;
  totalCount: number;
  personCounts: Record<string, number>;
}) {
  const selectedMonth = usePeriod((state) => state.month);
  const selectedYear = usePeriod((state) => state.year);
  const [viewPeriod, setViewPeriod] = useUrlFilters<ViewPeriod>(
    VIEW_PERIOD_KEYS,
    { month: String(selectedMonth), year: String(selectedYear) },
  );
  const hasPeriod = !!(
    viewPeriod.month ||
    viewPeriod.year ||
    viewPeriod.desde ||
    viewPeriod.hasta
  );
  const count =
    countPlatformFilters(filters, PLATFORM_SHEET_FILTER_KEYS) +
    Number(hasPeriod);
  const monthName = viewPeriod.month
    ? getMonthName(Number(viewPeriod.month))
    : undefined;
  const periodLabel =
    viewPeriod.desde || viewPeriod.hasta
      ? monthRangeLabel(viewPeriod.desde, viewPeriod.hasta)
      : viewPeriod.month && viewPeriod.year
        ? `${monthName?.charAt(0).toLocaleUpperCase()}${monthName?.slice(1)} ${viewPeriod.year}`
        : (viewPeriod.year ?? "");

  return (
    <FilterSheetShell
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="w-[min(26rem,calc(100vw-1rem))] gap-0 p-0"
      headerClassName="gap-2 border-b p-5 pr-12"
      bodyClassName="space-y-5 p-5"
      footerClassName="flex-row items-center justify-between border-t bg-background p-4"
      header={
        <>
          <SheetTitle className="flex items-center gap-2">
            Filtros
            {count > 0 && (
              <span className="rounded-full bg-brand/15 px-2 text-xs font-semibold text-brand">
                {count}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Mostrando {resultCount} de {totalCount} plataformas
          </SheetDescription>
        </>
      }
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={count === 0}
            onClick={() => {
              onFiltersChange({ q: filters.q });
              setViewPeriod({});
            }}
          >
            <Trash2 className="size-4" />
            Limpiar todo
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9 px-4"
            onClick={() => onOpenChange(false)}
          >
            Ver {resultCount} resultados
          </Button>
        </>
      }
    >
      <section className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          {hasPeriod && (
            <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
          )}
          Período
        </h3>
        <FixedCostPeriodSelector
          defaultValue={{ month: selectedMonth, year: selectedYear }}
          showPresets={false}
        />
      </section>
      <PlatformFilterFields
        filters={filters}
        onFiltersChange={onFiltersChange}
        statuses={SUBSCRIPTION_STATUSES}
        personCounts={personCounts}
      />
    </FilterSheetShell>
  );
}
