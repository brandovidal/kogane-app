import { Badge } from "@/ui/badge";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "@/shared/labels";
import { cn } from "@/shared/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(PAYMENT_STATUS_COLORS[status], className)}
    >
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
