import type { LucideIcon } from "lucide-react";

export function FixedCostDetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 border-b py-2 last:border-0">
      <dt className="inline-flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </dt>
      <dd className="min-w-0 wrap-anywhere text-right text-sm font-medium">
        {value}
      </dd>
    </div>
  );
}
