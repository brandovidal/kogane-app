import { History, PanelRightClose } from "lucide-react";
import { RecordHistoryPanel } from "@/features/history/components/RecordHistoryPanel";
import { Button } from "@/ui/button";

export interface FixedCostDetailHistorySectionProps {
  id: string;
  onCollapse?: () => void;
}

export function FixedCostDetailHistorySection({
  id,
  onCollapse,
}: FixedCostDetailHistorySectionProps) {
  return (
    <aside
      id="fixed-cost-detail-history"
      className="flex min-h-0 min-w-0 flex-col gap-4 border-t p-4 lg:border-t-0 lg:border-l"
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <History aria-hidden="true" className="size-4 text-primary" />
          Historial del registro
        </h2>
        {onCollapse && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Ocultar historial"
            onClick={onCollapse}
          >
            <PanelRightClose aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="min-h-0 min-w-0 lg:overflow-y-auto lg:overscroll-contain">
        <RecordHistoryPanel key={id} entity="exp_fixed_costs" id={id} />
      </div>
    </aside>
  );
}
