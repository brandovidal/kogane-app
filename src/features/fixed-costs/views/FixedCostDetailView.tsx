import { useEffect, useState } from "react";
import { History, Pencil } from "lucide-react";
import type { FixedCost } from "@/shared/api/types";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { getMonthName } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";
import { FixedCostDetailOverviewSection } from "../sections/FixedCostDetailOverviewSection";
import { FixedCostDetailHistorySection } from "../sections/FixedCostDetailHistorySection";
import { cn } from "@/shared/utils/cn";

export interface FixedCostDetailViewProps {
  fixedCost?: FixedCost;
  categoryName: string;
  personName: string;
  accountName: string;
  onClose: () => void;
  onEdit: () => void;
}

export function FixedCostDetailView({
  fixedCost,
  categoryName,
  personName,
  accountName,
  onClose,
  onEdit,
}: FixedCostDetailViewProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  useEffect(() => {
    setHistoryOpen(false);
  }, [fixedCost?.id]);
  return (
    <Sheet open={!!fixedCost} onOpenChange={(open) => !open && onClose()}>
      {fixedCost && (
        <SheetContent
          side="right"
          className={cn(
            "w-full overflow-y-auto",
            historyOpen ? "sm:max-w-4xl" : "sm:max-w-lg",
          )}
        >
          <SheetHeader className="shrink-0 border-b pb-4 pr-12">
            <SheetTitle className="flex flex-wrap items-center gap-2 text-left">
              {fixedCost.description}
              <StatusBadge status={fixedCost.paymentStatus} />
            </SheetTitle>
            <SheetDescription>
              {categoryName} · {getMonthName(fixedCost.paymentMonth)}{" "}
              {fixedCost.paymentYear}
            </SheetDescription>
          </SheetHeader>
          <div
            className={cn("shrink-0", historyOpen && "md:grid md:grid-cols-2")}
          >
            <FixedCostDetailOverviewSection
              fixedCost={fixedCost}
              categoryName={categoryName}
              personName={personName}
              accountName={accountName}
              actions={
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button size="sm" onClick={onEdit}>
                    <Pencil aria-hidden="true" className="mr-1.5 size-4" />
                    Editar costo fijo
                  </Button>
                  <Button
                    type="button"
                    variant={historyOpen ? "secondary" : "ghost"}
                    size="sm"
                    aria-expanded={historyOpen}
                    aria-controls="fixed-cost-detail-history"
                    onClick={() => setHistoryOpen((open) => !open)}
                  >
                    <History aria-hidden="true" className="size-4" />
                    Historial
                  </Button>
                </div>
              }
            />
            {historyOpen && <FixedCostDetailHistorySection id={fixedCost.id} />}
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
}
