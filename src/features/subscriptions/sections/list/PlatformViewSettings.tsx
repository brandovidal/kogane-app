import {
  CalendarRange,
  Columns3,
  Eye,
  Layers,
  Link2,
  ListFilter,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  ColumnVisibilityOptions,
  ViewSettingsMenu,
  type ColumnVisibilityOption,
} from "@/shared/components/toolbar";
import { Button } from "@/ui/button";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/ui/dropdown-menu";

const GROUP_OPTIONS = [
  { value: "period", label: "Período" },
  { value: "person", label: "Persona" },
] as const;

export function PlatformViewSettings({
  columns,
  visible,
  filterCount,
  onOpenFilters,
  groupBy,
  onGroupByChange,
  canReset,
  onReset,
}: {
  columns: readonly ColumnVisibilityOption[];
  visible: number;
  filterCount: number;
  onOpenFilters: () => void;
  groupBy: Array<"person" | "period">;
  onGroupByChange: (groupBy: Array<"person" | "period">) => void;
  canReset: boolean;
  onReset: () => void;
}) {
  const copyViewLink = () =>
    void navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("Enlace copiado"))
      .catch(() => toast.error("No se pudo copiar el enlace"));

  return (
    <ViewSettingsMenu
      trigger={
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5">
          <SlidersHorizontal className="size-4" />
          <span className="hidden sm:inline">Ajustes</span>
        </Button>
      }
      className="w-72"
    >
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Eye className="size-4" />
          Columnas visibles
          <span className="ml-auto text-xs text-muted-foreground">
            {visible}/{columns.length}
          </span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="max-h-[min(70vh,32rem)] w-60 overflow-y-auto">
          <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
          <ColumnVisibilityOptions columns={columns} />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuItem onSelect={onOpenFilters}>
        <ListFilter className="size-4" />
        Filtros
        {filterCount > 0 && (
          <span className="ml-auto text-xs text-brand">{filterCount}</span>
        )}
      </DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Layers className="size-4" />
          Agrupar
          <span className="ml-auto max-w-32 truncate text-xs text-muted-foreground">
            {groupBy
              .map(
                (field) =>
                  GROUP_OPTIONS.find((option) => option.value === field)?.label,
              )
              .join(" › ") || "Sin agrupar"}
          </span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuLabel>Agrupar por (en orden)</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={!groupBy.length}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() => onGroupByChange([])}
          >
            Sin agrupar
          </DropdownMenuCheckboxItem>
          {GROUP_OPTIONS.map(({ value, label }) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={groupBy.includes(value)}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) =>
                onGroupByChange(
                  checked
                    ? [...groupBy, value]
                    : groupBy.filter((item) => item !== value),
                )
              }
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled>
        <CalendarRange className="size-4" />
        Color condicional
        <span className="ml-auto text-[10px] text-muted-foreground">
          Próximamente
        </span>
      </DropdownMenuItem>
      <DropdownMenuItem disabled>
        <Columns3 className="size-4" />
        Totales del pie
        <span className="ml-auto text-[10px] text-muted-foreground">
          Próximamente
        </span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={copyViewLink}>
        <Link2 className="size-4" />
        Copiar enlace a la vista
      </DropdownMenuItem>
      <DropdownMenuItem disabled>
        <RotateCcw className="size-4" />
        Guardar como nueva vista
        <span className="ml-auto text-[10px] text-muted-foreground">
          Próximamente
        </span>
      </DropdownMenuItem>
      <DropdownMenuItem disabled={!canReset} onSelect={onReset}>
        <RotateCcw className="size-4" />
        Restablecer vista
      </DropdownMenuItem>
    </ViewSettingsMenu>
  );
}
