import {
  Activity,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  LayoutGrid,
  ListFilter,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { cn } from "@/shared/utils/cn";

export type CardOverviewView =
  "summary" | "movements" | "currency" | "installments" | "period";
const VIEWS = [
  { value: "summary", label: "Resumen", Icon: LayoutGrid },
  { value: "movements", label: "Movimientos", Icon: ListFilter },
  { value: "currency", label: "Por moneda", Icon: CircleDollarSign },
] as const;

export function CardOverviewViewBar({
  view,
  onViewChange,
  onNewExpense,
  onNewCard,
}: {
  view: CardOverviewView;
  onViewChange: (view: CardOverviewView) => void;
  onNewExpense: () => void;
  onNewCard: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        role="tablist"
        aria-label="Vistas de tarjetas"
        className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none]"
      >
        {VIEWS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={view === value}
            onClick={() => onViewChange(value)}
            className={cn(
              "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
              view === value &&
                "bg-accent text-foreground ring-1 ring-border/70",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
        {(view === "period" || view === "installments") && (
          <button
            type="button"
            role="tab"
            aria-selected="true"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-accent px-2.5 text-sm font-medium text-foreground ring-1 ring-border/70"
          >
            {view === "period" ? "Por período" : "Cuotas"}
          </button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8"
          aria-label="Nueva tarjeta"
          onClick={onNewCard}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Más opciones"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onViewChange("period")}>
              Vista por período
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onViewChange("installments")}>
              <Activity className="size-4" /> Cuotas
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onNewCard}>
              Nueva tarjeta
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onNewExpense}>
              Nuevo gasto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          onClick={onNewCard}
        >
          <CreditCard className="size-4" />
          <span className="hidden sm:inline">Nueva tarjeta</span>
        </Button>
        <div className="inline-flex items-center">
          <Button
            type="button"
            size="sm"
            className="card-primary-button h-9 gap-1 rounded-l-md rounded-r-none px-4"
            onClick={onNewExpense}
          >
            <Plus className="size-4" />
            Nuevo gasto
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="card-primary-button h-9 w-9 rounded-l-none rounded-r-md border-l border-background/20"
                aria-label="Más opciones para crear"
              >
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onNewExpense}>
                Nuevo gasto
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onNewCard}>
                Nueva tarjeta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
