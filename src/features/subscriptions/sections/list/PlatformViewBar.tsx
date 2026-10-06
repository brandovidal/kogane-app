import { toast } from "sonner";
import { CalendarDays, ChevronDown, Columns3, LayoutGrid, MoreHorizontal, Plus, Table2 } from "lucide-react";
import type { ViewMode } from "@/shared/types/data-view";
import { ExportMenu, type ExportMenuItem } from "@/shared/components/toolbar/ExportMenu";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { cn } from "@/shared/utils/cn";

type PlatformView = "list" | "cards" | "period" | "calendar";
const views: { value: PlatformView; label: string; Icon: typeof Table2 }[] = [
  { value: "list", label: "Lista", Icon: Table2 },
  { value: "cards", label: "Tarjetas", Icon: LayoutGrid },
  { value: "period", label: "Por período", Icon: Columns3 },
  { value: "calendar", label: "Calendario", Icon: CalendarDays },
];

export function PlatformViewBar({
  view, onViewChange, onCreate, exportItems,
}: {
  view: PlatformView;
  onViewChange: (view: PlatformView) => void;
  onCreate: () => void;
  exportItems: ExportMenuItem[];
}) {
  return <div className="flex flex-wrap items-center justify-between gap-3">
    <div role="tablist" aria-label="Vistas de plataformas" className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {views.map(({ value, label, Icon }) => <button key={value} type="button" role="tab" aria-selected={view === value} onClick={() => onViewChange(value)} className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", view === value && "bg-accent text-foreground ring-1 ring-border/70")}><Icon className="size-4" />{label}</button>)}
      <Button type="button" variant="ghost" size="icon-sm" className="size-8 border border-border/60" aria-label="Más vistas, próximamente" onClick={() => toast.info("Las vistas personalizadas estarán disponibles próximamente.")}><Plus className="size-4" /></Button>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <ExportMenu items={exportItems} label="Más opciones" iconOnly />
      <div className="inline-flex items-center">
        <Button type="button" size="sm" className="platform-create-button h-9 gap-1 rounded-l-md rounded-r-none px-4" onClick={onCreate}><Plus className="size-4" />Nueva plataforma</Button>
        <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" size="icon" className="platform-create-button h-9 w-9 rounded-l-none rounded-r-md border-l border-background/20" aria-label="Más opciones para crear"><ChevronDown className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={onCreate}><MoreHorizontal className="size-4" />Nueva plataforma</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </div>
    </div>
  </div>;
}

export type { PlatformView };
export const layoutForPlatformView = (view: PlatformView): ViewMode => view === "cards" ? "cards" : "table";
