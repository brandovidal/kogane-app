import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/shared/utils/cn";

export interface FieldLabelProps {
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function FieldLabel({
  icon: Icon,
  children,
  className,
}: FieldLabelProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {Icon && <Icon aria-hidden="true" className="size-3.5 text-muted-foreground" />}
      {children}
    </span>
  );
}
