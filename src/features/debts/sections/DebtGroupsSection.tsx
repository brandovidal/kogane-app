import { ChevronRight } from "lucide-react";
import type { Debt } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { type ViewMode } from "@/shared/types/data-view";
import type { Direction } from "@/features/debts/lib/debt-filters";
import { DebtGridSection } from "./DebtGridSection";
import { CollectButton } from "./CollectButton";

export function CollapsibleDebtGroup({
  title,
  total,
  debts,
  direction,
  view,
  onPay,
  onEdit,
  selected,
  onSelectedChange,
  groupTypes = false,
  cardNames,
  collapsible = true,
}: {
  title: string;
  total: number;
  debts: Debt[];
  direction: Direction;
  view: ViewMode;
  onPay: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  selected: Set<string>;
  onSelectedChange: (selected: Set<string>) => void;
  groupTypes?: boolean;
  cardNames?: Map<string, string>;
  collapsible?: boolean;
}) {
  const content = (
    <div className="space-y-3 border-t p-3">
      <DebtGridSection
        debts={debts}
        view={view}
        onPay={onPay}
        onEdit={onEdit}
        selected={selected}
        onSelectedChange={onSelectedChange}
        groupTypes={groupTypes && view === "table"}
        cardNames={cardNames}
      />
    </div>
  );
  const heading = (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
      <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {debts.length} {debts.length === 1 ? "cobro" : "cobros"}
      </span>
      <span className="shrink-0 font-semibold tabular-nums">{formatCurrency(total)}</span>
      {direction === "owed_to_me" && (
        <CollectButton
          name={title}
          debts={debts.filter((debt) => debt.balance > 0)}
          cardNames={cardNames ?? new Map()}
        />
      )}
    </div>
  );

  if (!collapsible) {
    return (
      <section className="rounded-md border bg-card">
        <div className="flex items-center gap-3 px-3 py-3">{heading}</div>
        {content}
      </section>
    );
  }

  return (
    <details className="group rounded-md border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 [&::-webkit-details-marker]:hidden">
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
        {heading}
      </summary>
      {content}
    </details>
  );
}
