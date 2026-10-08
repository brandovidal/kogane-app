import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/ui/button";
import { cn } from "@/shared/utils/cn";

export function FixedCostToolbarButton({
  icon: Icon,
  label,
  count,
  active,
  className,
  ...props
}: ComponentProps<typeof Button> & {
  icon: LucideIcon;
  label: string;
  count?: number | string;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 gap-1.5 rounded-sm border border-transparent px-2 text-muted-foreground hover:border-border/60 hover:text-foreground",
        active && "border-border/70 bg-accent text-foreground",
        className,
      )}
      {...props}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{label}</span>
      {count != null && count !== 0 && (
        <span className="text-xs font-semibold tabular-nums text-brand">
          {count}
        </span>
      )}
    </Button>
  );
}
