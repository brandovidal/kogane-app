import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/ui/button";

export interface BulkActionsToolbarProps {
  count: number;
  pending?: boolean;
  onClear: () => void;
  children: ReactNode;
}

export function BulkActionsToolbar({
  count,
  pending,
  onClear,
  children,
}: BulkActionsToolbarProps) {
  if (!count) return null;
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2"
      aria-busy={pending || undefined}
    >
      <span className="mr-auto text-sm font-medium" role="status">
        {count} {count === 1 ? "seleccionado" : "seleccionados"}
      </span>
      {children}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        disabled={pending}
        onClick={onClear}
        aria-label="Quitar selección"
      >
        <X aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}
