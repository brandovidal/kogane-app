import type { FixedCost } from "@/shared/api/types";
import type { Column } from "@/shared/types/data-view";
import { AttachmentRecordThumbnail } from "@/features/attachments/components/AttachmentRecordThumbnail";
import { Checkbox } from "@/ui/checkbox";
import { parseInstallment } from "../../lib/fixed-cost-views";

export function FixedCostCard({
  cost,
  columns,
  selected,
  onSelectedChange,
  selectionDisabled,
}: {
  cost: FixedCost;
  columns: Column<FixedCost>[];
  selected: boolean;
  onSelectedChange: (checked: boolean) => void;
  selectionDisabled: boolean;
}) {
  const column = (key: string) => columns.find((item) => item.key === key);
  const title = column("description");
  const amount = column("amount");
  const plan = parseInstallment(cost.installment);

  return (
    <article
      className={`group overflow-hidden rounded-xl border bg-card transition-colors hover:border-brand/35 ${selected ? "border-brand/70 ring-2 ring-brand/15" : "border-border/80"}`}
    >
      <div className="relative">
        <AttachmentRecordThumbnail
          refType="fixed_cost"
          refId={cost.id}
          label={cost.description}
          showPlaceholder
          variant="cover"
        />
        <Checkbox
          aria-label={`Seleccionar ${cost.description}`}
          checked={selected}
          disabled={selectionDisabled}
          onCheckedChange={(checked) => onSelectedChange(checked === true)}
          className="absolute left-3 top-3 z-10 border-white/80 bg-background/70 shadow-sm"
        />
        <div className="absolute right-2 top-2 z-10 [&_button]:bg-background/70 [&_button]:shadow-sm">
          {column("actions")?.cell(cost)}
        </div>
      </div>
      <div className="space-y-2.5 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 truncate font-semibold">
            {title?.cardCell?.(cost) ?? title?.cell(cost)}
          </div>
          <div className="shrink-0">{column("status")?.cell(cost)}</div>
        </div>
        <div className="rounded-md bg-muted/45 px-2.5 py-1 text-xl font-semibold tracking-tight tabular-nums">
          {amount?.cell(cost)}
        </div>
        {plan && (
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-brand"
              style={{ width: `${plan.percent}%` }}
            />
          </div>
        )}
        <div className="flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground">
          <span className="truncate">{column("category")?.cell(cost)}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{column("person")?.cell(cost)}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{column("account")?.cell(cost)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 border-t pt-2 text-xs text-muted-foreground">
          <span className="truncate">Vence {column("due")?.cell(cost)}</span>
          {plan && (
            <span className="shrink-0 tabular-nums">{plan.percent}%</span>
          )}
        </div>
      </div>
    </article>
  );
}
