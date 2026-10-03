import { cn } from "@/shared/utils/cn";
import { CategoryIcon } from "./CategoryIcon";

export function CategoryLabel({
  name,
  icon,
  color,
  className,
}: {
  name: string;
  icon?: string | null;
  color?: string | null;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <CategoryIcon icon={icon} color={color} size="xs" />
      <span className="truncate">{name}</span>
    </span>
  );
}
