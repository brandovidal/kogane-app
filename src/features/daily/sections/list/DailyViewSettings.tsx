import type { ReactElement } from 'react'
import { ArrowDownUp, Eye, Filter, Layers, LayoutGrid, Link2, RotateCcw, Table2 } from 'lucide-react'
import { toast } from 'sonner'
import { ColumnVisibilityOptions, ViewSettingsMenu, type ColumnVisibilityOption } from '@/shared/components/toolbar'
import type { ViewMode } from '@/shared/types/data-view'
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/ui/dropdown-menu'
import { DAILY_SORT_OPTIONS, type DailySort } from '../../constants/daily'

export function DailyViewSettings({
  trigger,
  open,
  onOpenChange,
  view,
  onViewChange,
  columns,
  visibleColumnCount,
  filterCount,
  groupBy,
  groupOptions,
  onGroupByChange,
  sort,
  onSortChange,
  onOpenFilters,
  onReset,
  hasCustomSettings,
}: {
  trigger: ReactElement
  open: boolean
  onOpenChange: (open: boolean) => void
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  columns: ColumnVisibilityOption[]
  visibleColumnCount: number
  filterCount: number
  groupBy: string
  groupOptions?: { value: string; label: string }[]
  onGroupByChange: (groupBy: string) => void
  sort: DailySort
  onSortChange: (sort: DailySort) => void
  onOpenFilters: () => void
  onReset: () => void
  hasCustomSettings: boolean
}) {
  return (
    <ViewSettingsMenu
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      className="max-h-[min(80vh,42rem)] w-72 overflow-y-auto rounded-xl border-border/80 bg-popover p-1.5 shadow-xl"
    >
      <DropdownMenuLabel className="px-2.5 pt-1 text-[10px] uppercase tracking-wider text-muted-foreground">Diseño</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={view} onValueChange={(next) => onViewChange(next as ViewMode)}>
        <DropdownMenuRadioItem value="table" onSelect={(event) => event.preventDefault()} className="rounded-md py-2">
          <Table2 className="size-4" /> Tabla
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="cards" onSelect={(event) => event.preventDefault()} className="rounded-md py-2">
          <LayoutGrid className="size-4" /> Tarjetas
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator className="my-1.5" />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="rounded-md py-2">
          <Eye className="size-4" /> Columnas visibles
          <span className="ml-auto text-xs text-muted-foreground">
            {visibleColumnCount}/{columns.length}
          </span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="max-h-[min(70vh,32rem)] w-64 overflow-y-auto rounded-xl border-border/80 bg-popover p-1.5 shadow-xl">
          <DropdownMenuLabel className="px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">Columnas visibles</DropdownMenuLabel>
          <ColumnVisibilityOptions columns={columns} className="rounded-md py-2" />
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuItem onSelect={onOpenFilters} className="rounded-md py-2">
        <Filter className="size-4" /> Filtros
        {filterCount > 0 && <span className="ml-auto text-xs font-medium text-brand">{filterCount}</span>}
      </DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="rounded-md py-2">
          <ArrowDownUp className="size-4" /> Orden
          <span className="ml-auto max-w-32 truncate text-xs text-muted-foreground">
            {DAILY_SORT_OPTIONS.find((option) => option.value === sort)?.label}
          </span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-64 rounded-xl border-border/80 bg-popover p-1.5 shadow-xl">
          <DropdownMenuLabel className="px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">Ordenar por</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={(next) => onSortChange(next as DailySort)}>
            {DAILY_SORT_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value} onSelect={(event) => event.preventDefault()} className="rounded-md py-2">
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      {groupOptions && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-md py-2">
            <Layers className="size-4" /> Agrupar
            <span className="ml-auto max-w-32 truncate text-xs text-muted-foreground">
              {groupOptions.find((option) => option.value === groupBy)?.label ?? 'Sin agrupar'}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-60 rounded-xl border-border/80 bg-popover p-1.5 shadow-xl">
            <DropdownMenuLabel className="px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">Agrupar por</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={groupBy === 'none'}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={() => onGroupByChange('none')}
              className="rounded-md py-2"
            >
              Sin agrupar
            </DropdownMenuCheckboxItem>
            {groupOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={groupBy === option.value}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={(checked) => onGroupByChange(checked ? option.value : 'none')}
                className="rounded-md py-2"
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
      <DropdownMenuSeparator className="my-1.5" />
      <DropdownMenuItem
        onSelect={() =>
          void navigator.clipboard
            .writeText(window.location.href)
            .then(() => toast.success('Enlace copiado'))
            .catch(() => toast.error('No se pudo copiar el enlace'))
        }
        className="rounded-md py-2"
      >
        <Link2 className="size-4" /> Copiar enlace a la vista
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => toast.info('Guardar vistas personalizadas estará disponible próximamente.')} className="rounded-md py-2">
        <Layers className="size-4" /> Guardar como nueva vista
      </DropdownMenuItem>
      <DropdownMenuSeparator className="my-1.5" />
      <DropdownMenuItem disabled={!hasCustomSettings} onSelect={onReset} className="rounded-md py-2 text-muted-foreground">
        <RotateCcw className="size-4" /> Restablecer vista
      </DropdownMenuItem>
    </ViewSettingsMenu>
  )
}
