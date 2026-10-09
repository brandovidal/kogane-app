import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/ui/collapsible";

export interface IndicatorsDisclosureProps {
  children: ReactNode;
  summary: string;
  collapsedContent?: ReactNode;
  ariaLabel: string;
  defaultOpen?: boolean;
  expandedLabel?: string;
  collapsedLabel?: string;
}

export function IndicatorsDisclosure({
  children,
  summary,
  collapsedContent,
  ariaLabel,
  defaultOpen = true,
  expandedLabel = "Reducir",
  collapsedLabel = "Ver",
}: IndicatorsDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        type="button"
        className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-3 py-2 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${open ? "Reducir" : "Mostrar"} ${ariaLabel}`}
      >
        <span className="text-sm font-medium">Indicadores</span>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {!open && collapsedContent ? (
            <div className="min-w-0 flex-1">{collapsedContent}</div>
          ) : !open ? (
            <span className="truncate text-sm tabular-nums text-muted-foreground">
              {summary}
            </span>
          ) : null}
          <span className="shrink-0 text-xs text-muted-foreground">
            {open ? expandedLabel : collapsedLabel}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}
