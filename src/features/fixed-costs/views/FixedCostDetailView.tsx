import { Pencil } from "lucide-react";
import type { FixedCost } from "@/shared/api/types";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { getMonthName } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/sheet";
import { FixedCostDetailOverviewSection } from "../sections/FixedCostDetailOverviewSection";

export interface FixedCostDetailViewProps {
  fixedCost?: FixedCost;
  categoryName: string;
  personName: string;
  accountName: string;
  onClose: () => void;
  onEdit: () => void;
}

export function FixedCostDetailView({ fixedCost, categoryName, personName, accountName, onClose, onEdit }: FixedCostDetailViewProps) {
  return (
    <Sheet open={!!fixedCost} onOpenChange={(open) => !open && onClose()}>
      {fixedCost && (
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="border-b pb-4 pr-12">
            <SheetTitle className="flex flex-wrap items-center gap-2 text-left">
              {fixedCost.description}
              <StatusBadge status={fixedCost.paymentStatus} />
            </SheetTitle>
            <SheetDescription>
              {categoryName} · {getMonthName(fixedCost.paymentMonth)} {fixedCost.paymentYear}
            </SheetDescription>
          </SheetHeader>
          <FixedCostDetailOverviewSection
            fixedCost={fixedCost}
            categoryName={categoryName}
            personName={personName}
            accountName={accountName}
            actions={
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={onEdit}><Pencil aria-hidden="true" className="mr-1.5 size-4" />Editar costo fijo</Button>
              </div>
            }
          />
        </SheetContent>
      )}
    </Sheet>
  );
}
