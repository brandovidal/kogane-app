import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  History,
  Maximize2,
  Minimize2,
  Paperclip,
  Pencil,
  Trash2,
} from "lucide-react";
import type { FixedCost } from "@/shared/api/types";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { AttachmentsPanel } from "@/features/attachments/components/AttachmentsPanel";
import { useAttachments } from "@/features/attachments/hooks/attachments";
import { RecordHistoryPanel } from "@/features/history/components/RecordHistoryPanel";
import { useRecordHistory } from "@/features/history/hooks/history";
import { groupPaymentStatuses } from "@/features/expenses/lib/group-payment-statuses";
import { FIXED_COST_STATUSES } from "../constants/statuses";
import { DeleteConfirmationDialog } from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { ATTACHMENT_KIND_LABELS } from "@/features/attachments/constants/attachments";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/ui/select";
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

export interface FixedCostDetailPageProps {
  fixedCost?: FixedCost;
  categoryName: string;
  personName: string;
  accountName: string;
  onClose: () => void;
  onEdit: () => void;
  initialTab?: DetailTab;
  onStatusChange: (cost: FixedCost, status: string) => void;
  onDelete: (cost: FixedCost) => void | Promise<unknown>;
  items: FixedCost[];
  onNavigate: (cost: FixedCost) => void;
}

export type DetailTab = "detail" | "files" | "history";

export function FixedCostDetailPage({
  fixedCost,
  categoryName,
  personName,
  accountName,
  onClose,
  onEdit,
  initialTab = "detail",
  onStatusChange,
  onDelete,
  items,
  onNavigate,
}: FixedCostDetailPageProps) {
  const [tab, setTab] = useState<DetailTab>(initialTab);
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterKind, setFilterKind] = useState<string>("all");
  const [uploadKind, setUploadKind] = useState<string>("boleta");
  const attachments = useAttachments("fixed_cost", fixedCost?.id ?? "", { enabled: !!fixedCost });
  const history = useRecordHistory("exp_fixed_costs", fixedCost?.id ?? "", { enabled: !!fixedCost });
  const files = attachments.data ?? [];
  const currentIndex = fixedCost ? items.findIndex((item) => item.id === fixedCost.id) : -1;
  const previous = currentIndex > 0 ? items[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1] : undefined;
  const latestChange = history.data?.items?.[0];
  const attachmentKinds = Object.keys(ATTACHMENT_KIND_LABELS);
  const fileFilters = ["all", ...attachmentKinds];

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
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px]">{files.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-none px-0">
                <History aria-hidden="true" />
                Historial
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-[10px]">{history.data?.total ?? 0}</Badge>
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
                actions={<div className="flex flex-wrap items-center gap-2">
                  <Select value={fixedCost.paymentStatus} onValueChange={(status) => onStatusChange(fixedCost, status)}>
                    <SelectTrigger className="w-[190px]" aria-label="Cambiar estado"><SelectValue><StatusBadge status={fixedCost.paymentStatus} /></SelectValue></SelectTrigger>
                    <SelectContent>{groupPaymentStatuses(FIXED_COST_STATUSES).map((group) => <SelectGroup key={group.label}><SelectLabel>{group.label}</SelectLabel>{group.options.map((status) => <SelectItem key={status} value={status}><StatusBadge status={status} /></SelectItem>)}</SelectGroup>)}</SelectContent>
                  </Select>
                  <Button size="sm" onClick={onEdit}><Pencil aria-hidden="true" className="size-4" />Editar</Button>
                </div>}
              />
              {(files.length > 0 || latestChange) && <div className="space-y-3 px-4 pb-4">
                {files.length > 0 && <button type="button" onClick={() => setTab("files")} className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/30">
                  <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">{files[0].contentType.startsWith("image/") && files[0].url ? <img src={files[0].url} alt="" className="size-full object-cover" /> : <Paperclip className="size-4" />}</span>
                  <span className="min-w-0 flex-1"><span className="block font-medium">{files.length} {files.length === 1 ? "archivo adjunto" : "archivos adjuntos"}</span><span className="block truncate text-sm text-muted-foreground">{ATTACHMENT_KIND_LABELS[files[0].kind] ?? files[0].kind} · {files[0].name}</span></span><Eye className="size-4 text-muted-foreground" /></button>}
                {latestChange && <button type="button" onClick={() => setTab("history")} className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/30"><History className="size-5 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1"><span className="block font-medium">Último cambio · {new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(latestChange.createdAt))}</span><span className="block truncate text-sm text-muted-foreground">{latestChange.changes[0]?.field ?? latestChange.action}</span></span><Eye className="size-4 text-muted-foreground" /></button>}
              </div>}
            </TabsContent>
            <TabsContent
              value="files"
              className="min-h-0 overflow-y-auto overscroll-contain p-4"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Adjuntos</h2><span className="text-sm text-muted-foreground">{files.length} archivos</span></div>
                <div className="space-y-2"><p className="text-xs font-medium">Tipo para los archivos nuevos</p><div className="flex flex-wrap gap-2">{attachmentKinds.map((kind) => <Button key={kind} type="button" size="sm" variant={uploadKind === kind ? "secondary" : "outline"} className="h-8 rounded-full" aria-pressed={uploadKind === kind} onClick={() => setUploadKind(kind)}>{uploadKind === kind && <span aria-hidden="true">✓</span>}{ATTACHMENT_KIND_LABELS[kind]}</Button>)}</div><p className="text-xs text-muted-foreground">Se aplica a los archivos que subas ahora.</p></div>
                <div className="flex flex-wrap gap-2 border-t pt-3" aria-label="Filtrar archivos por tipo">{fileFilters.map((kind) => { const count = kind === "all" ? files.length : files.filter((file) => file.kind === kind).length; if (kind !== "all" && !count) return null; return <Button key={kind} type="button" size="sm" variant={filterKind === kind ? "secondary" : "ghost"} className="h-8" onClick={() => setFilterKind(kind)} aria-pressed={filterKind === kind}>{kind === "all" ? "Todos" : ATTACHMENT_KIND_LABELS[kind]} <span className="ml-1 text-muted-foreground">{count}</span></Button>; })}</div>
                <AttachmentsPanel key={fixedCost.id} refType="fixed_cost" refId={fixedCost.id} kind={uploadKind as never} showKindSelect={false} filterKind={filterKind as never} dropzone emptyMessage="Aún no hay archivos adjuntos. Sube una boleta, recibo o contrato para tener el respaldo de este gasto." />
              </div>
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
          <footer className="flex shrink-0 items-center justify-between border-t px-4 py-3">
            <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}><Trash2 className="size-4" />Eliminar</Button>
            <div className="flex items-center gap-2"><Button type="button" variant="outline" size="icon" aria-label="Costo anterior" disabled={!previous} onClick={() => previous && onNavigate(previous)}><ChevronLeft className="size-4" /></Button><Button type="button" variant="outline" size="icon" aria-label="Costo siguiente" disabled={!next} onClick={() => next && onNavigate(next)}><ChevronRight className="size-4" /></Button></div>
          </footer>
          <DeleteConfirmationDialog open={confirmDelete} onOpenChange={setConfirmDelete} title="¿Eliminar costo fijo?" description={<>Se eliminará «{fixedCost.description}». Esta acción no se puede deshacer.</>} pending={deleting} onConfirm={() => { setDeleting(true); Promise.resolve(onDelete(fixedCost)).then(() => { setConfirmDelete(false); onClose(); }).catch(() => undefined).finally(() => setDeleting(false)); }} />
        </SheetContent>
      )}
    </Sheet>
  );
}
