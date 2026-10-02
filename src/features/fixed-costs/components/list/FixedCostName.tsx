import { ArrowUpRight } from "lucide-react";
import type { FixedCost } from "@/shared/api/types";
import { Badge } from "@/ui/badge";
import { AttachmentRecordThumbnail } from "@/features/attachments/components/AttachmentRecordThumbnail";

export function FixedCostName({ cost, onOpen }: { cost: FixedCost; onOpen: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <AttachmentRecordThumbnail refType="fixed_cost" refId={cost.id} label={cost.description} />
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="group inline-flex min-w-0 max-w-full items-center gap-1 truncate whitespace-nowrap text-left font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Ver detalle de ${cost.description}`}
          onClick={onOpen}
        >
          {cost.description}
          <ArrowUpRight aria-hidden="true" className="size-3.5 opacity-0 transition-opacity group-hover:opacity-70 group-focus-visible:opacity-70" />
        </button>
        {cost.installment && <Badge variant="outline" className="shrink-0 text-xs">{cost.installment}</Badge>}
      </div>
    </div>
  );
}
