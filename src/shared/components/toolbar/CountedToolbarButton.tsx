import type { ComponentProps, ReactNode } from "react";

import { Badge } from "@/ui/badge";
import { Button, type buttonVariants } from "@/ui/button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

export type CountedToolbarButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
  label: string;
  count?: number;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  floatingCount?: boolean;
  variant?: VariantProps<typeof buttonVariants>["variant"];
};

export function CountedToolbarButton({
  label,
  count = 0,
  icon,
  trailingIcon,
  floatingCount = false,
  variant = "outline",
  className,
  ...props
}: CountedToolbarButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      className={cn("h-9", floatingCount && "relative mr-1.5", className)}
      {...props}
    >
      {icon}
      {label}
      {count > 0 && (
        <Badge
          variant="secondary"
          className={
            floatingCount
              ? "absolute -right-1.5 -top-1.5 z-10 ml-0 h-4 min-w-4 justify-center px-1 text-[10px] leading-none"
              : "ml-1"
          }
        >
          {count}
        </Badge>
      )}
      {trailingIcon}
    </Button>
  );
}
