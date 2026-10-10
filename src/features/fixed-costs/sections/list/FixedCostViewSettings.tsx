import type { ReactElement } from "react";
import {
  ArrowDownUp,
  Columns3,
  Eye,
  Layers,
  LayoutGrid,
  Link2,
  ListFilter,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Table2,
} from "lucide-react";
import { toast } from "sonner";
import {
  ColumnVisibilityOptions,
  RowColorRulesMenu,
  ViewSettingsMenu,
  type ColumnVisibilityOption,
  type RowColorRulesMenuProps,
} from "@/shared/components/toolbar";
import type { ViewMode } from "@/shared/types/data-view";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/ui/dropdown-menu";
import {
  FIXED_COST_GROUP_LABELS,
  FIXED_COST_GROUP_OPTIONS,
} from "../../lib/fixed-cost-filters";
import { FIXED_COST_SORTS } from "../../lib/fixed-cost-views";
import type { FixedCostGroupBy } from "../../types/fixed-cost-types";

export interface FixedCostViewSettingsProps {
  trigger: ReactElement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  canChangeLayout: boolean;
  columns: ColumnVisibilityOption[];
  visibleColumnCount: number;
  filterCount: number;
  onOpenFilters: () => void;
  canSort: boolean;
  sort?: string;
  sortLabel?: string;
  onSortChange: (sort: string | undefined) => void;
  canGroup: boolean;
  groupBy: FixedCostGroupBy;
  onGroupByChange: (groupBy: FixedCostGroupBy) => void;
  hasViewSettings: boolean;
  onResetView: () => void;
  rowColors?: RowColorRulesMenuProps;
}

/** Settings menu composition specific to the Fixed Costs view. */
export function FixedCostViewSettings({
  trigger,
  open,
  onOpenChange,
  view,
  onViewChange,
  canChangeLayout,
  columns,
  visibleColumnCount,
  filterCount,
  onOpenFilters,
  canSort,
  sort,
  sortLabel,
  onSortChange,
  canGroup,
  groupBy,
  onGroupByChange,
  hasViewSettings,
  onResetView,
  rowColors,
}: FixedCostViewSettingsProps) {
  return (
    <ViewSettingsMenu open={open} onOpenChange={onOpenChange} trigger={trigger}>
      {canChangeLayout && (
        <>
          <DropdownMenuLabel className="px-2.5 pt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            Diseño
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={view}
            onValueChange={(next) => onViewChange(next as ViewMode)}
          >
            <DropdownMenuRadioItem
              value="table"
              onSelect={(event) => event.preventDefault()}
              className="rounded-md py-2"
            >
              <Table2 className="size-4" /> Tabla
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="cards"
              onSelect={(event) => event.preventDefault()}
              className="rounded-md py-2"
            >
              <LayoutGrid className="size-4" /> Tarjetas
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </>
      )}
      <DropdownMenuSeparator className="my-1.5" />
      {columns.length > 0 && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-md py-2">
            <Eye className="size-4" /> Columnas visibles
            <span className="ml-auto text-xs text-muted-foreground">
              {visibleColumnCount}/{columns.length}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-[min(70vh,32rem)] w-64 overflow-y-auto rounded-xl border-border/80 bg-popover p-1.5 shadow-xl">
            <DropdownMenuLabel className="px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Columnas visibles
            </DropdownMenuLabel>
            <ColumnVisibilityOptions
              columns={columns}
              className="rounded-md py-2"
            />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
      <DropdownMenuItem onSelect={onOpenFilters} className="rounded-md py-2">
        <ListFilter className="size-4" /> Filtros
        {filterCount > 0 && (
          <span className="ml-auto text-xs font-medium text-brand">
            {filterCount}
          </span>
        )}
      </DropdownMenuItem>
      {canSort && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-md py-2">
            <ArrowDownUp className="size-4" /> Orden
            <span className="ml-auto max-w-32 truncate text-xs text-muted-foreground">
              {sortLabel ?? "Original"}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64 rounded-xl border-border/80 bg-popover p-1.5 shadow-xl">
            <DropdownMenuLabel className="px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Orden
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={sort ?? "__original__"}
              onValueChange={(next) =>
                onSortChange(next === "__original__" ? undefined : next)
              }
            >
              <DropdownMenuRadioItem
                value="__original__"
                onSelect={(event) => event.preventDefault()}
                className="rounded-md py-2"
              >
                Orden original
              </DropdownMenuRadioItem>
              {FIXED_COST_SORTS.map((option) => (
                <DropdownMenuRadioItem
                  key={option.value}
                  value={option.value}
                  onSelect={(event) => event.preventDefault()}
                  className="rounded-md py-2"
                >
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
      {rowColors && view === "table" && <RowColorRulesMenu {...rowColors} />}
      {canGroup && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-md py-2">
            <Layers className="size-4" /> Agrupar
            <span className="ml-auto max-w-32 truncate text-xs text-muted-foreground">
              {groupBy.length
                ? groupBy
                    .map((field) => FIXED_COST_GROUP_LABELS[field])
                    .join(" › ")
                : "Sin agrupar"}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-60 rounded-xl border-border/80 bg-popover p-1.5 shadow-xl">
            <DropdownMenuLabel className="px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              Agrupar por
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={!groupBy.length}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={() => onGroupByChange([])}
              className="rounded-md py-2"
            >
              Sin agrupar
            </DropdownMenuCheckboxItem>
            {FIXED_COST_GROUP_OPTIONS.map((option) => {
              const field = option.value as FixedCostGroupBy[number];
              return (
                <DropdownMenuCheckboxItem
                  key={field}
                  checked={groupBy.includes(field)}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) =>
                    onGroupByChange(
                      checked
                        ? [...groupBy, field]
                        : groupBy.filter((item) => item !== field),
                    )
                  }
                  className="rounded-md py-2"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
      <DropdownMenuSeparator className="my-1.5" />
      <DropdownMenuItem disabled className="rounded-md py-2">
        <SlidersHorizontal className="size-4" /> Color condicional
        <span className="ml-auto text-[10px] text-muted-foreground">
          Próximamente
        </span>
      </DropdownMenuItem>
      <DropdownMenuItem disabled className="rounded-md py-2">
        <Columns3 className="size-4" /> Totales del pie
        <span className="ml-auto text-[10px] text-muted-foreground">
          Próximamente
        </span>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="my-1.5" />
      <DropdownMenuItem
        onSelect={() =>
          void navigator.clipboard
            .writeText(window.location.href)
            .then(() => toast.success("Enlace copiado"))
            .catch(() => toast.error("No se pudo copiar el enlace"))
        }
        className="rounded-md py-2"
      >
        <Link2 className="size-4" /> Copiar enlace a la vista
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() =>
          toast.info(
            "Guardar vistas personalizadas estará disponible próximamente.",
          )
        }
        className="rounded-md py-2"
      >
        <Plus className="size-4" /> Guardar como nueva vista
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={!hasViewSettings}
        onSelect={onResetView}
        className="rounded-md py-2 text-muted-foreground"
      >
        <RotateCcw className="size-4" /> Restablecer vista
      </DropdownMenuItem>
    </ViewSettingsMenu>
  );
}
