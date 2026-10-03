import { useState, type ReactNode } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/ui/collapsible";
import { Marker, MarkerContent, MarkerIcon } from "@/ui/marker";
import { Badge } from "@/ui/badge";
import { cn } from "@/shared/utils/cn";

export interface MoreFiltersProps {
  activeCount?: number;
  children: ReactNode;
}

export function MoreFilters({ activeCount = 0, children }: MoreFiltersProps) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        type="button"
        className="w-full rounded-sm py-2 text-left outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Marker render={<span />} variant="border">
          <MarkerIcon>
            <SlidersHorizontal />
          </MarkerIcon>
          <MarkerContent className="flex-1 text-foreground">
            {open ? "Ver menos filtros" : "Ver más filtros"}
          </MarkerContent>
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="shrink-0 text-xs tabular-nums"
              aria-label={`${activeCount} filtros adicionales activos`}
            >
              {activeCount} activos
            </Badge>
          )}
          <MarkerIcon>
            <ChevronDown
              className={cn(
                "size-4 transition-transform motion-reduce:transition-none",
                open && "rotate-180",
              )}
            />
          </MarkerIcon>
        </Marker>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
