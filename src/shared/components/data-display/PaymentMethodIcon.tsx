import type { CSSProperties } from "react";
import type { PaymentMethod } from "@/shared/api/types";
import { cn } from "@/shared/utils/cn";
import { PAYMENT_METHOD_ICONS } from "@/shared/constants/payment-methods";

export interface PaymentMethodIconProps {
  type: PaymentMethod["type"];
  color?: string | null;
  className?: string;
}

export function PaymentMethodIcon({
  type,
  color,
  className,
}: PaymentMethodIconProps) {
  const Icon = PAYMENT_METHOD_ICONS[type];
  const style: CSSProperties | undefined = color
    ? {
        color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
      }
    : undefined;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary [&>svg]:size-3",
        className,
      )}
      style={style}
    >
      <Icon />
    </span>
  );
}
