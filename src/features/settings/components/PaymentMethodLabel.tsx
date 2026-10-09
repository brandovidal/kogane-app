import { cn } from "@/shared/utils/cn";
import {
  PaymentMethodIcon,
  type PaymentMethodIconProps,
} from "./PaymentMethodIcon";

export interface PaymentMethodLabelProps extends PaymentMethodIconProps {
  name: string;
}

export function PaymentMethodLabel({
  name,
  type,
  color,
  className,
}: PaymentMethodLabelProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <PaymentMethodIcon type={type} color={color} />
      <span className="truncate">{name}</span>
    </span>
  );
}
