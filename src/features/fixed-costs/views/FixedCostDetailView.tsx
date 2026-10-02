import { useEffect, useRef, useState } from "react";
import { History, Maximize2, Minimize2, Pencil } from "lucide-react";
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
import { FixedCostDetailOverviewSection } from "../sections/detail/FixedCostDetailOverviewSection";
import { FixedCostDetailHistorySection } from "../sections/detail/FixedCostDetailHistorySection";
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
  const [expanded, setExpanded] = useState(false);
  const historyTrigger = useRef<HTMLButtonElement>(null);
  const collapseHistory = () => {
    setHistoryOpen(false);
    requestAnimationFrame(() => historyTrigger.current?.focus());
  };
  useEffect(() => {
    setHistoryOpen(false);
    setExpanded(false);
  }, [fixedCost?.id]);
  return (
    <Sheet open={!!fixedCost} onOpenChange={(open) => !open && onClose()}>
      {fixedCost && (
        <SheetContent
          side="right"
          className={cn(
            "w-full gap-0 overflow-hidden",
            expanded
              ? "sm:max-w-none"
              : historyOpen
                ? "sm:max-w-6xl"
                : "sm:max-w-xl",
          )}
        >
          <SheetHeader className="min-w-0 shrink-0 border-b pb-4 pr-12 sm:pr-24">
            <SheetTitle className="flex min-w-0 flex-wrap items-center gap-2 text-left">
              <span className="min-w-0 wrap-anywhere">
                {fixedCost.description}
              </span>
              <StatusBadge status={fixedCost.paymentStatus} />
            </SheetTitle>
            <SheetDescription className="wrap-anywhere">
              {categoryName} · {getMonthName(fixedCost.paymentMonth)}{" "}
              {fixedCost.paymentYear}
            </SheetDescription>
          </SheetHeader>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-2.5 right-12 hidden sm:inline-flex"
            aria-label={
              expanded
                ? "Reducir detalle"
                : "Ampliar detalle a pantalla completa"
            }
            aria-pressed={expanded}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? (
              <Minimize2 aria-hidden="true" />
            ) : (
              <Maximize2 aria-hidden="true" />
            )}
          </Button>
          <div
            className={cn(
              "min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain",
              historyOpen && "lg:grid lg:grid-cols-2 lg:overflow-hidden",
            )}
          >
            <FixedCostDetailOverviewSection
              fixedCost={fixedCost}
              categoryName={categoryName}
              personName={personName}
              accountName={accountName}
              className={
                historyOpen
                  ? "lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain"
                  : undefined
              }
              actions={
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button size="sm" onClick={onEdit}>
                    <Pencil aria-hidden="true" className="mr-1.5 size-4" />
                    Editar costo fijo
                  </Button>
                  <Button
                    ref={historyTrigger}
                    type="button"
                    variant={historyOpen ? "secondary" : "ghost"}
                    size="sm"
                    aria-expanded={historyOpen}
                    aria-controls="fixed-cost-detail-history"
                    onClick={() => setHistoryOpen((open) => !open)}
                  >
                    <History aria-hidden="true" className="size-4" />
                    {historyOpen ? "Ocultar historial" : "Ver historial"}
                  </Button>
                </div>
              }
            />
            {historyOpen && (
              <FixedCostDetailHistorySection
                id={fixedCost.id}
                onCollapse={collapseHistory}
              />
            )}
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
}
