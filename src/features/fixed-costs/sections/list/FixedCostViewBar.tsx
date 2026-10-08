import { toast } from "sonner";
import { cn } from "@/shared/utils/cn";

import {
  Activity,
  CalendarDays,
  ChevronDown,
  Clock,
  KanbanSquare,
  Plus,
  ReceiptText,
  Table2,
} from "lucide-react";
import { newExpenseStore } from "@/features/new-expense/stores/new-expense.store";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

import {
  ExportMenu,
  type ExportMenuItem,
} from "@/shared/components/toolbar/ExportMenu";
import {
  FIXED_COST_VIEWS,
  type FixedCostView,
} from "../../lib/fixed-cost-views";

const VIEW_ICONS: Record<FixedCostView, typeof CalendarDays> = {
  mes: CalendarDays,
  "por-pagar": Clock,
  cuotas: Activity,
  estado: KanbanSquare,
  todos: Table2,
};

export function FixedCostViewBar({
  page,
  onPageChange,
  exportItems,
  onCreate,
}: {
  page: FixedCostView;
  onPageChange: (page: FixedCostView) => void;
  exportItems: ExportMenuItem[];
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-1">
        <div
          role="tablist"
          aria-label="Vistas"
          className="-mx-1 flex min-w-0 gap-1 overflow-x-auto px-1 pb-1 sm:pb-0 [scrollbar-width:none]"
        >
          {FIXED_COST_VIEWS.map((view) => {
            const Icon = VIEW_ICONS[view.value];
            const active = view.value === page;
            return (
              <button
                key={view.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onPageChange(view.value)}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active && "bg-accent text-foreground ring-1 ring-border/70",
                )}
              >
                <Icon className="size-4" />
                {view.label}
              </button>
            );
          })}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Más vistas: próximamente"
          aria-label="Más vistas, próximamente"
          className="rounded-sm border border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
          onClick={() =>
            toast.info(
              "La creación de vistas personalizadas estará disponible próximamente.",
            )
          }
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
            className="fixed-costs-create-button h-9 gap-1 rounded-l-sm rounded-r-none px-4"
            onClick={onCreate}
            aria-label="Crear costo fijo"
          >
            <Plus className="size-4" />
            Crear
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="fixed-costs-create-button fixed-costs-create-menu-button h-9 w-9 rounded-l-none rounded-r-sm border-l"
                aria-label="Más opciones para crear"
              >
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem onSelect={onCreate}>
                <CalendarDays className="size-4" />
                Costo fijo
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  newExpenseStore.getState().openWith({ destination: "daily" })
                }
              >
                <ReceiptText className="size-4" />
                Gasto general
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
