import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/ui/button";
import { cn } from "@/shared/utils/cn";

export function AppliedViewToggle({
  count,
  open,
  onOpenChange,
}: {
  count: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (count <= 0) return null;

  return (
    <>
      <span
        aria-hidden="true"
        className="mx-1 hidden h-5 w-px bg-border sm:block"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className={cn(
          "h-8 gap-1 px-2 text-xs text-muted-foreground",
          open && "bg-accent text-foreground",
        )}
      >
        {open ? (
          <ChevronDown aria-hidden="true" className="size-4" />
        ) : (
          <ChevronRight aria-hidden="true" className="size-4" />
        )}
        {open ? "Ocultar aplicados" : "Ver aplicados"}
      </Button>
    </>
  );
}
