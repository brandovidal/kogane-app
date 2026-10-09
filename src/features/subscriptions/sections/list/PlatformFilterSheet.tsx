import { Trash2 } from "lucide-react";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { FilterSheetShell } from "@/shared/components/filters/FilterSheetShell";
import { Button } from "@/ui/button";
import { SheetDescription, SheetTitle } from "@/ui/sheet";
import { usePeriod } from "@/shared/stores/period.store";
import { FixedCostPeriodSelector } from "@/features/fixed-costs/components/header/FixedCostPeriodSelector";
import { formatDate, getMonthName } from "@/shared/lib/dates";
import { PLATFORM_FILTER_KEYS } from "../../constants/platforms";
import { SUBSCRIPTION_STATUSES } from "../../constants/subscriptions";
import { countPlatformFilters } from "../../lib/platform-filters";
import { PlatformFilterFields } from "./PlatformFilterFields";
import { PlatformPeriodFilter } from "./PlatformPeriodFilter";

const PLATFORM_SHEET_FILTER_KEYS = PLATFORM_FILTER_KEYS.filter(
  (key) => key !== "q",
);

function getDuePeriodChip(filters: ExpenseFilterValues) {
  const from = filters.dueFrom?.slice(0, 10);
  const to = filters.dueTo?.slice(0, 10);
  if (!from && !to) return undefined;

  let label: string;
  if (!from) label = `Cobro hasta ${formatDate(to!)}`;
  else if (!to) label = `Cobro desde ${formatDate(from)}`;
  else {
    const start = new Date(`${from}T12:00:00`);
    const end = new Date(`${to}T12:00:00`);
    const isMonth =
      start.getDate() === 1 &&
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      end.getDate() === new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    const isYear =
      start.getMonth() === 0 &&
      start.getDate() === 1 &&
      end.getMonth() === 11 &&
      end.getDate() === 31 &&
      start.getFullYear() === end.getFullYear();
    label = isMonth
      ? `Cobro en ${getMonthName(start.getMonth() + 1)} ${start.getFullYear()}`
      : isYear
        ? `Cobro en ${start.getFullYear()}`
        : `Cobro: ${formatDate(from)} – ${formatDate(to)}`;
  }

  return {
    key: "due-period",
    label,
  };
}

function clearDueRange(filters: ExpenseFilterValues) {
  return { ...filters, dueFrom: undefined, dueTo: undefined };
}

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
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const setPeriod = usePeriod((state) => state.setPeriod);
  const count = countPlatformFilters(filters, PLATFORM_SHEET_FILTER_KEYS);
  const duePeriodChip = getDuePeriodChip(filters);

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
          <ActiveExpenseFilterChips
            fields={PLATFORM_SHEET_FILTER_KEYS.filter(
              (key) => key !== "dueFrom" && key !== "dueTo",
            )}
            value={filters}
            onChange={onFiltersChange}
            me={me}
            maxVisibleItems={3}
            collapsible={false}
            formatFilterLabel={(key, label) =>
              key === "period" || key === "currency"
                ? label.replace(/^(Persona|Período|Moneda):\s*/, "")
                : key === "method"
                  ? label.replace(/^Medio de pago:/, "Cuenta de cobro:")
                  : label
            }
            tone="brand"
            periodChip={
              duePeriodChip && {
                ...duePeriodChip,
                onRemove: () => onFiltersChange(clearDueRange(filters)),
              }
            }
          />
        </>
      }
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={count === 0}
            onClick={() => onFiltersChange({ q: filters.q })}
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
        <h3 className="eyebrow">Período de la vista</h3>
        <FixedCostPeriodSelector
          value={{ month, year }}
          onChange={({ month: nextMonth, year: nextYear }) =>
            setPeriod(nextMonth, nextYear)
          }
          modes={["month"]}
          showPresets={false}
        />
      </section>
      <PlatformPeriodFilter filters={filters} onFiltersChange={onFiltersChange} />
      <section className="space-y-3">
        <h3 className="eyebrow">Filtros</h3>
        <PlatformFilterFields
          filters={filters}
          onFiltersChange={onFiltersChange}
          statuses={SUBSCRIPTION_STATUSES}
          personCounts={personCounts}
        />
      </section>
    </FilterSheetShell>
  );
}
