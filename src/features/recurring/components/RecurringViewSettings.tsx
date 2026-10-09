import type { ReactElement } from "react";
import {
  Eye,
  ArrowDownUp,
  LayoutGrid,
  Link2,
  ListFilter,
  RotateCcw,
  SlidersHorizontal,
  Table2,
} from "lucide-react";
import { toast } from "sonner";
import type { ColumnVisibilityOption } from "@/shared/components/toolbar";
import {
  ColumnVisibilityOptions,
  ViewSettingsMenu,
} from "@/shared/components/toolbar";
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
import type { ViewMode } from "@/shared/types/data-view";

export interface RecurringViewSettingsProps {
  trigger: ReactElement;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  columns: readonly ColumnVisibilityOption[];
  visibleColumnCount: number;
  groupBy: readonly string[];
  groupOptions: readonly { value: string; label: string }[];
  onGroupByChange: (groupBy: string[]) => void;
  sort: string;
  sortOptions: readonly { value: string; label: string; descending: boolean }[];
  onSortChange: (sort: string) => void;
  subtotals: boolean;
  onSubtotalsChange: (enabled: boolean) => void;
  showCount: boolean;
  onShowCountChange: (enabled: boolean) => void;
  showSum: boolean;
  onShowSumChange: (enabled: boolean) => void;
  collapsedGroups: boolean;
  onCollapsedGroupsChange: (enabled: boolean) => void;
  onOpenFilters: () => void;
  filterCount: number;
  onReset: () => void;
  canReset: boolean;
}

export function RecurringViewSettings({
  trigger,
  view,
  onViewChange,
  columns,
  visibleColumnCount,
  groupBy,
  groupOptions,
  onGroupByChange,
  sort,
  sortOptions,
  onSortChange,
  subtotals,
  onSubtotalsChange,
  showCount,
  onShowCountChange,
  showSum,
  onShowSumChange,
  collapsedGroups,
  onCollapsedGroupsChange,
  onOpenFilters,
  filterCount,
  onReset,
  canReset,
}: RecurringViewSettingsProps) {
  return (
    <ViewSettingsMenu
      trigger={trigger}
      className="max-h-[min(80vh,42rem)] w-72 overflow-y-auto rounded-xl border-border/80 bg-popover p-1.5 shadow-xl"
    >
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
      <DropdownMenuSeparator />
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
      <DropdownMenuItem onSelect={onOpenFilters} className="rounded-md py-2">
        <ListFilter className="size-4" /> Filtros
        {filterCount > 0 && (
          <span className="ml-auto text-xs font-medium text-brand">
            {filterCount}
          </span>
        )}
      </DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="rounded-md py-2">
          <ArrowDownUp className="size-4" /> Orden
          <span className="ml-auto text-xs text-muted-foreground">
            {sortOptions.find((option) => option.value === sort)?.label ??
              "Original"}
          </span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-56 rounded-xl border-border/80 bg-popover p-1.5 shadow-xl">
          <DropdownMenuLabel className="px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Ordenar por
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={onSortChange}>
            {sortOptions.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                onSelect={(event) => event.preventDefault()}
                className="rounded-md py-2"
              >
                {option.label}
                <span className="ml-auto text-xs text-muted-foreground">
                  {option.descending ? "↓" : "↑"}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="rounded-md py-2">
          <SlidersHorizontal className="size-4" /> Agrupar
          <span className="ml-auto max-w-32 truncate text-xs text-muted-foreground">
            {groupBy
              .map(
                (field) =>
                  groupOptions.find((option) => option.value === field)?.label,
              )
              .join(" › ") || "Sin agrupar"}
          </span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-64 rounded-xl border-border/80 bg-popover p-1.5 shadow-xl">
          <DropdownMenuLabel className="px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            Agrupar por (en orden)
          </DropdownMenuLabel>
          {groupOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={groupBy.includes(option.value)}
              disabled={!groupBy.includes(option.value) && groupBy.length >= 2}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) =>
                onGroupByChange(
                  checked
                    ? [...groupBy, option.value]
                    : groupBy.filter((field) => field !== option.value),
                )
              }
            >
              {option.label}
              {groupBy.includes(option.value) && groupBy.length > 1 && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {groupBy.indexOf(option.value) + 1}°
                </span>
              )}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuCheckboxItem
        checked={subtotals}
        onSelect={(event) => event.preventDefault()}
        onCheckedChange={onSubtotalsChange}
      >
        Subtotal por grupo
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={collapsedGroups}
        disabled={groupBy.length === 0}
        onSelect={(event) => event.preventDefault()}
        onCheckedChange={onCollapsedGroupsChange}
      >
        Grupos contraídos al abrir
      </DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
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
      <DropdownMenuLabel className="px-2.5 pt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        Totales del pie
      </DropdownMenuLabel>
      <DropdownMenuCheckboxItem
        checked={showCount}
        onSelect={(event) => event.preventDefault()}
        onCheckedChange={onShowCountChange}
      >
        COUNT
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={showSum}
        onSelect={(event) => event.preventDefault()}
        onCheckedChange={onShowSumChange}
      >
        SUM
      </DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        disabled={!canReset}
        onSelect={onReset}
        className="rounded-md py-2 text-muted-foreground"
      >
        <RotateCcw className="size-4" /> Restablecer vista
      </DropdownMenuItem>
    </ViewSettingsMenu>
  );
}
