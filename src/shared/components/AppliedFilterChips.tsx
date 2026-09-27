import { X } from "lucide-react";

import { Button } from "@/ui/button";

export interface AppliedFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
  kind?: "filter" | "group";
}

export function AppliedFilterChips({ items, ariaLabel = "Filtros activos" }: { items: AppliedFilterChip[]; ariaLabel?: string }) {
  if (!items.length) return null;
  return (
    <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap py-0.5" aria-label={ariaLabel}>
      {items.map((item, index) => (
        <span key={item.key} className="contents">
          {item.kind === "group" && index > 0 && <span aria-hidden="true" className="mx-1 inline-block h-5 border-l" />}
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
  );
}
