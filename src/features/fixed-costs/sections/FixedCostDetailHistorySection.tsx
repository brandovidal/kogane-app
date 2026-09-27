import { History } from "lucide-react";
import { RecordHistoryPanel } from "@/features/history/components/RecordHistoryPanel";

export function FixedCostDetailHistorySection({ id }: { id: string }) {
  return (
    <aside
      id="fixed-cost-detail-history"
      className="min-w-0 space-y-4 border-t p-4 md:border-t-0 md:border-l"
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <History aria-hidden="true" className="size-4 text-primary" />
        Historial del registro
      </h2>
      <RecordHistoryPanel key={id} entity="exp_fixed_costs" id={id} />
    </aside>
  );
}
