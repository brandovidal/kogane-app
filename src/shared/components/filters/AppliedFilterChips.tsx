import { ChevronDown, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/ui/button";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

export interface AppliedFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
  kind?: "filter" | "group";
}

export function AppliedFilterChips({
  items,
  ariaLabel = "Filtros activos",
  collapsible = false,
  onClearAll,
}: {
  items: AppliedFilterChip[];
  ariaLabel?: string;
  collapsible?: boolean;
  onClearAll?: () => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [expanded, setExpanded] = useState(!collapsible);
  useEffect(() => {
    if (collapsible) setExpanded(isDesktop);
  }, [collapsible, isDesktop]);
  if (!items.length) return null;
  return (
    <div className="flex min-w-0 items-center gap-2 py-0.5" aria-label={ariaLabel}>
      {collapsible && (
        <Button
          type="button"
          variant="outline"
          size="xs"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="shrink-0 gap-1.5"
        >
          <SlidersHorizontal aria-hidden="true" className="size-3.5" />
          <span>{expanded ? "Ocultar" : "Mostrar"}</span>
          <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums">{items.length}</span>
          <ChevronDown aria-hidden="true" className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </Button>
      )}
      {onClearAll && (
        <Button
          type="button"
          variant="destructive"
          size="xs"
          onClick={onClearAll}
          className="shrink-0 gap-1"
        >
          <Trash2 aria-hidden="true" className="size-3.5" />
          Limpiar todo
        </Button>
      )}
      {(!collapsible || expanded) && (
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap">
          {items.map((item, index) => (
            <span key={item.key} className="contents">
              {item.kind === "group" && index > 0 && (
                <span aria-hidden="true" className="mx-1 inline-block h-5 border-l" />
              )}
              <Button
                variant={item.kind === "group" ? "outline" : "secondary"}
                size="xs"
                className="max-w-56"
                onClick={item.onRemove}
                aria-label={`Quitar ${item.kind === "group" ? "agrupación" : "filtro"} ${item.label}`}
                title={item.label}
              >
                <span className="truncate">{item.label}</span><X />
              </Button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
