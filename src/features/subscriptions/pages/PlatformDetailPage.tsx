import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  History,
  Maximize2,
  Minimize2,
  Paperclip,
  Pencil,
  Repeat2,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import type { Subscription } from "@/shared/api/types";
import { CurrencyDisplay } from "@/features/expenses/components/CurrencyDisplay";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { AttachmentsPanel } from "@/features/attachments/components/AttachmentsPanel";
import { useAttachments } from "@/features/attachments/hooks/attachments";
import { RecordHistoryPanel } from "@/features/history/components/RecordHistoryPanel";
import { useRecordHistory } from "@/features/history/hooks/history";
import { DeleteConfirmationDialog } from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { LinkifiedText } from "@/shared/components/data-display/LinkifiedText";
import { EXPENSE_TYPE_LABELS } from "@/shared/constants/finance";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate, getMonthName } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { PlatformDetailRow } from "../components/detail/PlatformDetailRow";
import { PlatformMark } from "../components/PlatformMark";
import { SUBSCRIPTION_PERIOD_LABELS } from "../constants/subscriptions";
import { nextPlatformChargeDate } from "../lib/platform-summary";
import { RowActions } from "@/features/expenses/components/RowActions";
import { SUBSCRIPTION_STATUSES } from "../constants/subscriptions";
import { MonthYearPicker } from "@/shared/components/navigation/MonthYearPicker";

type DetailTab = "detail" | "files" | "history";

export function PlatformDetailPage({
  item,
  items,
  personName,
  accountName,
  todayKey,
  initialTab,
  onClose,
  onEdit,
  onMove,
  onDuplicate,
  onStatusChange,
  onPaymentPeriodChange,
  onDelete,
  onNavigate,
}: {
  item?: Subscription;
  items: Subscription[];
  personName: string;
  accountName: string;
  todayKey: string;
  initialTab: DetailTab;
  onClose: () => void;
  onEdit: () => void;
  onMove: () => void;
  onDuplicate: () => void;
  onStatusChange: (status: string) => void;
  onPaymentPeriodChange: (period: { month: number; year: number }) => void;
  onDelete: (item: Subscription) => Promise<unknown>;
  onNavigate: (item: Subscription) => void;
}) {
  const [tab, setTab] = useState<DetailTab>(initialTab);
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const attachments = useAttachments("expense", item?.id ?? "", {
    enabled: !!item,
  });
  const history = useRecordHistory("exp_subscriptions", item?.id ?? "", {
    enabled: !!item,
  });
  const files = attachments.data ?? [];
  const latestChange = history.data?.items?.[0];
  const currentIndex = item
    ? items.findIndex((candidate) => candidate.id === item.id)
    : -1;
  const previous = currentIndex > 0 ? items[currentIndex - 1] : undefined;
  const next =
    currentIndex >= 0 && currentIndex < items.length - 1
      ? items[currentIndex + 1]
      : undefined;
  const nextCharge = item ? nextPlatformChargeDate(item, todayKey) : null;

  useEffect(() => {
    setTab(initialTab);
    setExpanded(false);
  }, [item?.id, initialTab]);

  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      {item && (
        <SheetContent
          side="right"
          className={`w-full gap-0 overflow-hidden ${expanded ? "sm:max-w-none" : "sm:max-w-xl"}`}
        >
          <SheetHeader className="min-w-0 shrink-0 gap-1.5 pb-0 pr-12 sm:pr-24">
            <SheetTitle className="flex min-w-0 flex-wrap items-center gap-2 text-left text-lg tracking-tight">
              <PlatformMark name={item.description} className="size-7" />
              <span className="min-w-0 wrap-anywhere">{item.description}</span>
              <StatusBadge status={item.paymentStatus} />
            </SheetTitle>
            <SheetDescription className="wrap-anywhere">
              {SUBSCRIPTION_PERIOD_LABELS[item.period] ?? item.period} ·{" "}
              {getMonthName(item.paymentMonth)} {item.paymentYear} ·{" "}
              {formatCurrency(item.amountInPen ?? item.amount)}
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
            onClick={() => setExpanded((value) => !value)}
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
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 min-w-5 px-1 text-[10px]"
                >
                  {files.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-none px-0">
                <History aria-hidden="true" />
                Historial
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 min-w-5 px-1 text-[10px]"
                >
                  {history.data?.total ?? 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="detail"
              className="min-h-0 overflow-y-auto overscroll-contain"
            >
              <div className="space-y-5 p-4">
                <section className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border bg-muted/20 p-4">
                  <div>
                    <p className="eyebrow mb-1">Monto del registro</p>
                    <div className="text-3xl font-semibold tracking-tight tabular-nums">
                      <CurrencyDisplay
                        amount={item.amount}
                        currency={item.currency}
                        amountInPEN={item.amountInPen}
                        othersShare={item.othersShare}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={onEdit}>
                      <Pencil aria-hidden="true" className="size-4" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onMove}
                    >
                      <ArrowRightLeft aria-hidden="true" className="size-4" />
                      Transferir
                    </Button>
                    <RowActions
                      label={item.description}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onMove={onMove}
                      files={{ refType: "expense", refId: item.id }}
                      history={{ entity: "exp_subscriptions", id: item.id }}
                      onOpenFiles={() => setTab("files")}
                      onOpenHistory={() => setTab("history")}
                      status={{
                        value: item.paymentStatus,
                        options: SUBSCRIPTION_STATUSES,
                        onChange: onStatusChange,
                      }}
                    />
                  </div>
                </section>
                <dl
                  className="space-y-1 rounded-2xl border p-3"
                  aria-label="Datos de la plataforma"
                >
                  <PlatformDetailRow
                    icon={Repeat2}
                    label="Período"
                    value={
                      SUBSCRIPTION_PERIOD_LABELS[item.period] ?? item.period
                    }
                  />
                  <PlatformDetailRow
                    icon={UserRound}
                    label="Persona"
                    value={personName}
                  />
                  <PlatformDetailRow
                    icon={Wallet}
                    label="Tipo de gasto"
                    value={
                      EXPENSE_TYPE_LABELS[item.expenseType] ?? item.expenseType
                    }
                  />
                  <PlatformDetailRow
                    icon={CreditCard}
                    label="Cuenta"
                    value={accountName}
                  />
                  <PlatformDetailRow
                    icon={CalendarDays}
                    label="Mes de pago"
                    value={
                      <MonthYearPicker
                        value={{
                          month: item.paymentMonth,
                          year: item.paymentYear,
                        }}
                        onChange={onPaymentPeriodChange}
                        ariaLabel="Mes de pago"
                        className="h-8 w-auto min-w-36 justify-end border-0 bg-transparent px-0 hover:bg-transparent"
                      />
                    }
                  />
                  <PlatformDetailRow
                    icon={CalendarDays}
                    label="Próximo cobro"
                    value={nextCharge ? formatDate(nextCharge) : "Sin fecha"}
                  />
                  <PlatformDetailRow
                    icon={FileText}
                    label="Observación"
                    value={
                      <LinkifiedText
                        text={item.notes?.trim() || "Sin observación"}
                      />
                    }
                  />
                </dl>
                {(files.length > 0 || latestChange) && (
                  <div className="space-y-3">
                    {files.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setTab("files")}
                        className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/30"
                      >
                        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                          {files[0].contentType.startsWith("image/") &&
                          files[0].url ? (
                            <img
                              src={files[0].url}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <Paperclip className="size-4" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">
                            {files.length}{" "}
                            {files.length === 1
                              ? "archivo adjunto"
                              : "archivos adjuntos"}
                          </span>
                          <span className="block truncate text-sm text-muted-foreground">
                            {files[0].name}
                          </span>
                        </span>
                        <Eye className="size-4 text-muted-foreground" />
                      </button>
                    )}
                    {latestChange && (
                      <button
                        type="button"
                        onClick={() => setTab("history")}
                        className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/30"
                      >
                        <History className="size-5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">
                            Último cambio ·{" "}
                            {new Intl.DateTimeFormat("es-PE", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(latestChange.createdAt))}
                          </span>
                          <span className="block truncate text-sm text-muted-foreground">
                            {latestChange.changes[0]?.field ??
                              latestChange.action}
                          </span>
                        </span>
                        <Eye className="size-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="files"
              className="min-h-0 overflow-y-auto overscroll-contain p-4"
            >
              <AttachmentsPanel
                key={item.id}
                refType="expense"
                refId={item.id}
                dropzone
                emptyMessage="Aún no hay archivos adjuntos. Sube una boleta, recibo o contrato para respaldar esta plataforma."
              />
            </TabsContent>
            <TabsContent
              value="history"
              className="min-h-0 overflow-y-auto overscroll-contain p-4"
            >
              <RecordHistoryPanel
                key={item.id}
                entity="exp_subscriptions"
                id={item.id}
                compact
              />
            </TabsContent>
          </Tabs>
          <footer className="flex shrink-0 items-center justify-between border-t px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Plataforma anterior"
                disabled={!previous}
                onClick={() => previous && onNavigate(previous)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Plataforma siguiente"
                disabled={!next}
                onClick={() => next && onNavigate(next)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </footer>
          <DeleteConfirmationDialog
            open={confirmDelete}
            onOpenChange={setConfirmDelete}
            title="¿Eliminar plataforma?"
            description={
              <>
                Se eliminará «{item.description}». Esta acción no se puede
                deshacer.
              </>
            }
            pending={deleting}
            onConfirm={() => {
              setDeleting(true);
              Promise.resolve(onDelete(item))
                .then(() => {
                  setConfirmDelete(false);
                  onClose();
                })
                .catch(() => undefined)
                .finally(() => setDeleting(false));
            }}
          />
        </SheetContent>
      )}
    </Sheet>
  );
}
