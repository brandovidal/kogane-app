import { ChevronDown, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/ui/button";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { cn } from "@/shared/utils/cn";

export interface AppliedFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
  kind?: "filter" | "group";
}

export interface AppliedFilterChipsProps {
  items: AppliedFilterChip[];
  ariaLabel?: string;
  collapsible?: boolean;
  onClearAll?: () => void;
  tone?: "default" | "brand";
  maxVisibleItems?: number;
  showCollapseLabel?: boolean;
}

export function AppliedFilterChips({
  items,
  ariaLabel = "Filtros activos",
  collapsible = false,
  onClearAll,
  tone = "default",
  maxVisibleItems,
  showCollapseLabel = true,
}: AppliedFilterChipsProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [expanded, setExpanded] = useState(!collapsible);
  const [showAllItems, setShowAllItems] = useState(false);

  useEffect(() => {
    if (collapsible) setExpanded(isDesktop);
  }, [collapsible, isDesktop]);
  useEffect(() => setShowAllItems(false), [items.length]);

  if (!items.length) return null;

  const visibleItems =
    maxVisibleItems && !showAllItems ? items.slice(0, maxVisibleItems) : items;
  const hiddenCount = items.length - visibleItems.length;

  return (
    <div
      className="flex min-w-0 items-center gap-2 py-0.5"
      aria-label={ariaLabel}
    >
      {collapsible && (
        <Button
          type="button"
          variant="outline"
          size="xs"
          aria-expanded={expanded}
          aria-label={expanded ? "Ocultar filtros aplicados" : "Mostrar filtros aplicados"}
          onClick={() => setExpanded((current) => !current)}
          className="shrink-0 gap-1.5"
        >
          <SlidersHorizontal aria-hidden="true" className="size-3.5" />
          {showCollapseLabel && <span>{expanded ? "Ocultar" : "Mostrar"}</span>}
          <span className={cn(
            "rounded-full px-1.5 text-[10px] font-medium tabular-nums",
            tone === "brand" ? "bg-brand/15 text-brand" : "bg-muted",
          )}>
            {items.length}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </Button>
      )}
      {onClearAll && (
        <Button
          type="button"
          variant="outline"
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
          {visibleItems.map((item, index) => (
            <span key={item.key} className="contents">
              {item.kind === "group" && index > 0 && (
                <span
                  aria-hidden="true"
                  className="mx-1 inline-block h-5 border-l"
                />
              )}
              <Button
                variant={
                  tone === "brand" || item.kind === "group"
                    ? "outline"
                    : "secondary"
                }
                size="xs"
                className={cn(
                  "max-w-56",
                  tone === "brand" &&
                    "border-brand/40 bg-brand/10 text-brand hover:bg-brand/20",
                )}
                onClick={item.onRemove}
                aria-label={`Quitar ${item.kind === "group" ? "agrupación" : "filtro"} ${item.label}`}
                title={item.label}
              >
                <span className="truncate">{item.label}</span>
                <X className="size-3.5" />
              </Button>
            </span>
          ))}
          {hiddenCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setShowAllItems(true)}
              aria-label={`Mostrar ${hiddenCount} filtros más`}
              className="shrink-0 border-dashed text-muted-foreground"
            >
              +{hiddenCount} más
            </Button>
          )}
          {showAllItems &&
            maxVisibleItems &&
            items.length > maxVisibleItems && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setShowAllItems(false)}
                className="shrink-0 text-muted-foreground"
              >
                Ver menos
              </Button>
            )}
        </div>
      )}
    </div>
  );
}
