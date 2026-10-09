import { toast } from "sonner";
import {
  CalendarDays,
  ChevronDown,
  Columns3,
  Link2,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Repeat2,
  Table2,
  Upload,
} from "lucide-react";
import type { ViewMode } from "@/shared/types/data-view";
import {
  ExportMenu,
  type ExportMenuItem,
} from "@/shared/components/toolbar/ExportMenu";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { cn } from "@/shared/utils/cn";

type PlatformView = "list" | "cards" | "period" | "calendar";
const views: { value: PlatformView; label: string; Icon: typeof Table2 }[] = [
  { value: "list", label: "Lista", Icon: Table2 },
  { value: "period", label: "Por período", Icon: Columns3 },
  { value: "calendar", label: "Calendario", Icon: CalendarDays },
];

export function PlatformViewBar({
  view,
  onViewChange,
  onCreate,
  exportItems,
}: {
  view: PlatformView;
  onViewChange: (view: PlatformView) => void;
  onCreate: () => void;
  exportItems: ExportMenuItem[];
}) {
  const menuItems: ExportMenuItem[] = [
    ...exportItems,
    {
      label: "Importar plataformas…",
      icon: <Upload className="size-4" />,
      href: "/importacion",
    },
    {
      label: "Copiar enlace a la vista",
      icon: <Link2 className="size-4" />,
      onSelect: () => {
        void navigator.clipboard
          .writeText(window.location.href)
          .then(() => toast.success("Enlace copiado"))
          .catch(() => toast.error("No se pudo copiar el enlace"));
      },
    },
  ];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        role="tablist"
        aria-label="Vistas de plataformas"
        className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {views.map(({ value, label, Icon }) => {
          const selected =
            value === "list"
              ? view === "list" || view === "cards"
              : view === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onViewChange(value)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected && "bg-accent text-foreground ring-1 ring-border/70",
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
          className="size-8 border border-border/60"
          aria-label="Más vistas, próximamente"
          onClick={() =>
            toast.info(
              "Las vistas personalizadas estarán disponibles próximamente.",
            )
          }
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ExportMenu items={menuItems} label="Más opciones" iconOnly />
        <div className="inline-flex items-center">
          <Button
            type="button"
            size="sm"
            className="platform-create-button h-9 gap-1 rounded-l-md rounded-r-none px-4"
            onClick={onCreate}
          >
            <Plus className="size-4" />
            Nueva plataforma
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                className="platform-create-button h-9 w-9 rounded-l-none rounded-r-md border-l border-background/20"
                aria-label="Más opciones para crear"
              >
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuItem onSelect={onCreate}>
                <MoreHorizontal className="size-4" />
                <span className="flex flex-col">
                  Nueva plataforma
                  <span className="text-xs text-muted-foreground">
                    Suscripción o servicio periódico
                  </span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/recurrentes">
                  <Repeat2 className="size-4" />
                  <span className="flex flex-col">
                    Nueva recurrente
                    <span className="text-xs text-muted-foreground">
                      Se repite cada mes
                    </span>
                  </span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/mensajes">
                  <MessageSquareText className="size-4" />
                  <span className="flex flex-col">
                    Registrar en Mensajes
                    <span className="text-xs text-muted-foreground">
                      Captura, audio o texto
                    </span>
                  </span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/importacion">
                  <Upload className="size-4" />
                  Importar archivo…
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export type { PlatformView };
export const layoutForPlatformView = (view: PlatformView): ViewMode =>
  view === "cards" ? "cards" : "table";
