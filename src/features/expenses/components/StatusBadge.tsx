import { Badge } from "@/ui/badge";
import {
  PAYMENT_STATUS_DOT_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/shared/constants/finance";
import { cn } from "@/shared/utils/cn";

export interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(PAYMENT_STATUS_COLORS[status], className)}
    >
      {PAYMENT_STATUS_DOT_COLORS[status] && (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full",
            PAYMENT_STATUS_DOT_COLORS[status],
          )}
        />
      )}
      {label ?? PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
