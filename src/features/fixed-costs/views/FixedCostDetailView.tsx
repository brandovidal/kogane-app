import { useEffect, useState } from "react";
import {
  FileText,
  History,
  Maximize2,
  Minimize2,
  Paperclip,
  Pencil,
} from "lucide-react";
import type { FixedCost } from "@/shared/api/types";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { AttachmentGallery } from "@/features/attachments/components/AttachmentGallery";
import { RecordHistoryPanel } from "@/features/history/components/RecordHistoryPanel";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { FixedCostDetailOverviewSection } from "../sections/detail/FixedCostDetailOverviewSection";
import { cn } from "@/shared/utils/cn";

export interface FixedCostDetailViewProps {
  fixedCost?: FixedCost;
  categoryName: string;
  personName: string;
  accountName: string;
  onClose: () => void;
  onEdit: () => void;
  initialTab?: DetailTab;
}

export type DetailTab = "detail" | "files" | "history";

export function FixedCostDetailView({
  fixedCost,
  categoryName,
  personName,
  accountName,
  onClose,
  onEdit,
  initialTab = "detail",
}: FixedCostDetailViewProps) {
  const [tab, setTab] = useState<DetailTab>(initialTab);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setTab(initialTab);
    setExpanded(false);
  }, [fixedCost?.id, initialTab]);

  return (
    <Sheet open={!!fixedCost} onOpenChange={(open) => !open && onClose()}>
      {fixedCost && (
        <SheetContent
          side="right"
          className={cn(
            "w-full gap-0 overflow-hidden",
            expanded ? "sm:max-w-none" : "sm:max-w-xl",
          )}
        >
          <SheetHeader className="min-w-0 shrink-0 gap-1.5 pb-0 pr-12 sm:pr-24">
            <SheetTitle className="flex min-w-0 flex-wrap items-center gap-2 text-left text-lg tracking-tight">
              <span className="min-w-0 wrap-anywhere">
                {fixedCost.description}
              </span>
              <StatusBadge status={fixedCost.paymentStatus} />
            </SheetTitle>
            <SheetDescription className="wrap-anywhere">
              {categoryName} · {getMonthName(fixedCost.paymentMonth)}{" "}
              {fixedCost.paymentYear} ·{" "}
              {formatCurrency(fixedCost.amountInPen ?? fixedCost.amount)}
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
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as DetailTab)}
            className="min-h-0 flex-1 gap-0"
          >
            <TabsList
              variant="line"
              className="w-full justify-start gap-4 border-b px-4"
            >
              <TabsTrigger value="detail" className="flex-none px-0">
                <FileText aria-hidden="true" />
                Detalle
              </TabsTrigger>
              <TabsTrigger value="files" className="flex-none px-0">
                <Paperclip aria-hidden="true" />
                Archivos
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-none px-0">
                <History aria-hidden="true" />
                Historial
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="detail"
              className="min-h-0 overflow-y-auto overscroll-contain"
            >
              <FixedCostDetailOverviewSection
                fixedCost={fixedCost}
                categoryName={categoryName}
                personName={personName}
                accountName={accountName}
                showFiles={false}
                actions={
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={onEdit}>
                      <Pencil aria-hidden="true" className="size-4" />
                      Editar costo fijo
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setTab("files")}
                    >
                      <Paperclip aria-hidden="true" className="size-4" />
                      Archivos
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setTab("history")}
                    >
                      <History aria-hidden="true" className="size-4" />
                      Historial
                    </Button>
                  </div>
                }
              />
            </TabsContent>
            <TabsContent
              value="files"
              className="min-h-0 overflow-y-auto overscroll-contain p-4"
            >
              <AttachmentGallery
                key={fixedCost.id}
                refType="fixed_cost"
                refId={fixedCost.id}
              />
            </TabsContent>
            <TabsContent
              value="history"
              className="min-h-0 overflow-y-auto overscroll-contain p-4"
            >
              <RecordHistoryPanel
                key={fixedCost.id}
                entity="exp_fixed_costs"
                id={fixedCost.id}
              />
            </TabsContent>
          </Tabs>
        </SheetContent>
      )}
    </Sheet>
  );
}
