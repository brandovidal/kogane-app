import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/ui/button";

export function AppliedViewSummary({
  children,
  onAddFilter,
  onReset,
  resetDisabled = false,
}: {
  children: ReactNode;
  onAddFilter: () => void;
  onReset: () => void;
  resetDisabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-sm border border-dashed px-3 py-2">
      {children}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="h-7 shrink-0 gap-1 text-muted-foreground"
        onClick={onAddFilter}
      >
        <Plus className="size-3.5" /> Filtro
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className="ml-auto h-7 shrink-0 text-muted-foreground"
        disabled={resetDisabled}
        onClick={onReset}
      >
        Restablecer vista
      </Button>
    </div>
  );
}
