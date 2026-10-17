import { CalendarDays, ChevronDown, ListOrdered, Plus, Table2 } from "lucide-react";
import { toast } from "sonner";

import type { DailyLayout } from "../../types/daily-types";
import { DAILY_LAYOUTS } from "../../constants/daily";
import type { ExportMenuItem } from "@/shared/components/toolbar/ExportMenu";
import { ExportMenu } from "@/shared/components/toolbar/ExportMenu";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { DESTINATION_LABELS } from "@/features/drafts/constants/destinations";
import { useNewExpense } from "@/features/new-expense/stores/new-expense.store";
import { cn } from "@/shared/utils/cn";

const layoutIcons = {
  list: Table2,
  day: ListOrdered,
  calendar: CalendarDays,
} as const;

export function DailyViewBar({
  layout,
  onLayoutChange,
  exportItems,
}: {
  layout: DailyLayout;
  onLayoutChange: (layout: DailyLayout) => void;
  exportItems: ExportMenuItem[];
}) {
  const openNewExpense = useNewExpense((state) => state.openWith);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div role="tablist" aria-label="Vistas de Día a día" className="flex min-w-0 items-center gap-1 overflow-x-auto">
        {DAILY_LAYOUTS.map(({ value, label }) => {
          const Icon = layoutIcons[value];
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={layout === value}
              onClick={() => onLayoutChange(value)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                layout === value && "bg-accent text-foreground ring-1 ring-border/70",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Más vistas: próximamente"
          aria-label="Más vistas, próximamente"
          className="shrink-0 rounded-sm border border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
          onClick={() => toast.info("La creación de vistas personalizadas estará disponible próximamente.")}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <ExportMenu items={exportItems} label="Más opciones" iconOnly />
        <div className="inline-flex items-center">
          <Button
            type="button"
            size="sm"
            className="h-9 gap-1 rounded-l-sm rounded-r-none px-4"
            onClick={() => openNewExpense({ destination: "daily" })}
          >
            <Plus className="size-4" /> Nuevo gasto
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="icon" className="h-9 w-9 rounded-l-none rounded-r-sm border-l" aria-label="Elegir tipo de gasto">
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              {(["daily", "credit_card", "fixed_cost", "subscription", "receivable", "payable"] as const).map((destination) => (
                <DropdownMenuItem key={destination} onSelect={() => openNewExpense({ destination })}>
                  {DESTINATION_LABELS[destination]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
