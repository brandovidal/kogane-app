import { useState } from "react";
import { PlatformDueDateFilter } from "./PlatformDueDateFilter";
import { countPlatformFilters } from "../../lib/platform-filters";
import { SUBSCRIPTION_PERIOD_LABELS } from "../../constants/subscriptions";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { cn } from "@/shared/utils/cn";

type PeriodTab = "due" | "periodicity";

export function PlatformPeriodFilter({
  filters,
  onFiltersChange,
}: {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
}) {
  const [tab, setTab] = useState<PeriodTab>(() =>
    filters.period ? "periodicity" : "due",
  );
  const activeCount = countPlatformFilters(filters, ["dueFrom", "dueTo", "period"]);
  const selectTab = (next: PeriodTab) => {
    setTab(next);
    onFiltersChange(
      next === "due"
        ? { ...filters, period: undefined }
        : { ...filters, dueFrom: undefined, dueTo: undefined },
    );
  };

  return (
    <section className="space-y-3">
      <div className="eyebrow flex items-center gap-1.5">
        Período de cobro
        {activeCount > 0 && (
          <span className="normal-case tracking-normal text-brand">
            · {activeCount} aplicado{activeCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
      <div role="tablist" aria-label="Filtrar por período" className="grid grid-cols-2 rounded-lg bg-muted p-1">
        {([
          ["due", "Próximo cobro"],
          ["periodicity", "Periodicidad"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => selectTab(value)}
            className={cn(
              "h-9 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors",
              tab === value && "bg-background text-foreground shadow-sm",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Elige una sola forma: al cambiar, se limpia la otra.
      </p>
      {tab === "due" ? (
        <PlatformDueDateFilter filters={filters} onFiltersChange={onFiltersChange} />
      ) : (
        <div className="space-y-2">
          <div className="text-sm font-medium">Periodicidad</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SUBSCRIPTION_PERIOD_LABELS).map(([value, label]) => {
              const selected = filters.period === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onFiltersChange({ ...filters, period: selected ? undefined : value })}
                  className={cn(
                    "h-9 rounded-full border px-4 text-sm font-medium transition-colors hover:bg-accent",
                    selected && "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
