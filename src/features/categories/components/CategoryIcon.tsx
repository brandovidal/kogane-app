import type { CSSProperties } from "react";

import { cn } from "@/shared/utils/cn";
import { getCategoryIcon } from "@/features/categories/lib/category-icons";

export { CATEGORY_ICON_OPTIONS } from "@/features/categories/lib/category-icons";

const sizeClasses = {
  xs: "size-5 rounded [&>svg]:size-3",
  sm: "size-6 rounded-md [&>svg]:size-3.5",
  md: "size-8 rounded-lg [&>svg]:size-4",
} as const;

export function CategoryIcon({
  icon,
  color,
  size = "sm",
  className,
}: {
  icon?: string | null;
  color?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const Icon = getCategoryIcon(icon);
  const style: CSSProperties | undefined = color
    ? { color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }
    : undefined;

  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center justify-center", sizeClasses[size], className)}
      style={style}
    >
      <Icon />
    </span>
  );
}

