import type { ComponentProps, ReactNode } from "react";

import { Badge } from "@/ui/badge";
import { Button, type buttonVariants } from "@/ui/button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

type CountedToolbarButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
  label: string;
  count?: number;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  variant?: VariantProps<typeof buttonVariants>["variant"];
};

export function CountedToolbarButton({
  label,
  count = 0,
  icon,
  trailingIcon,
  variant = "outline",
  className,
  ...props
}: CountedToolbarButtonProps) {
  return (
    <Button variant={variant} size="sm" className={cn("h-9", className)} {...props}>
      {icon}
      {label}
      {count > 0 && <Badge variant="secondary" className="ml-1">{count}</Badge>}
      {trailingIcon}
    </Button>
  );
}
