import { useEffect, useState } from "react";
import { shareParts } from "@/features/expenses/lib/shared-expense";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  ImageIcon,
  Inbox,
  Mic,
  MessageSquare,
  Plus,
  RotateCw,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { DataView } from "@/shared/components/data-display/DataView";
import { cn } from "@/shared/utils/cn";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { ViewToggle } from "@/shared/components/data-display/ViewToggle";
import { type Column, type ViewMode } from "@/shared/types/data-view";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import {
  draftMediaKind,
  useOpenDraftMedia,
} from "@/features/drafts/hooks/draft-media";
import { nameById, usePeople } from "@/shared/api/hooks/catalogs";
import {
  useDiscardDraft,
  useDraftTabCounts,
  useDrafts,
  useRetryDraft,
  useSaveDraft,
  useUpdateDraft,
  type DraftFields,
  type DraftTab,
} from "@/features/drafts/hooks/drafts";
import { withQuery } from "@/shared/api/query";
import type { Schemas } from "@/shared/api/client";
import { DESTINATION_LABELS } from "@/features/drafts/constants/destinations";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { toDraftBody } from "@/features/drafts/lib/draft-form";
import {
  missingLabels,
  readyDrafts,
  summarizeDrafts,
} from "@/features/drafts/lib/draft-view";
import { DraftCard } from "./DraftCard";
import { DraftActionsMenu } from "./DraftActionsMenu";
import { DraftFailedCard, failureReason } from "./DraftFailedCard";
import { DraftForm } from "./DraftForm";
import { DraftIndicators } from "./DraftIndicators";

type Draft = NonNullable<
  Schemas["DraftListResponseDto"]["data"]
>["items"][number];

const FIELD_LABELS: Record<string, string> = {
  destination: "destino",
  description: "descripción",
  amount: "monto",
  personId: "persona",
  paymentMethodId: "medio de pago",
  categoryId: "categoría",
  period: "período",
};

const CHANNEL_ICONS = { telegram: Send, web: MessageSquare } as const;

const TAB_META = {
  review: { label: "Por revisar", icon: Inbox },
  failed: { label: "Fallidos", icon: AlertTriangle },
  discarded: { label: "Descartados", icon: Trash2 },
} as const;

// Borrador (D50): what the bot or the web could not save yet. Por revisar · Fallidos · Descartados
function DraftsPageView() {
  const [tab, setTab] = useState<DraftTab>("review");
  const [editing, setEditing] = useState<Draft | undefined>();
  const [view, setView] = useViewMode("drafts", "cards");
  const counts = useDraftTabCounts();
  const review = useDrafts("review").data?.items ?? [];
  const failed = useDrafts("failed").data?.items ?? [];
  const saveDraft = useSaveDraft({ quiet: true });
  const retryDraft = useRetryDraft();
  const ready = readyDrafts(review);

  const saveReady = async () => {
    const results = await Promise.allSettled(
      ready.map((draft) => saveDraft.mutateAsync(draft.id)),
    );
    const saved = results.filter((r) => r.status === "fulfilled").length;
    if (saved) toast.success(`${saved} guardados`);
  };
  const retryAll = async () => {
    await Promise.allSettled(
      failed.map((draft) => retryDraft.mutateAsync(draft.id)),
    );
  };

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(value) => setTab(value as DraftTab)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            {(Object.keys(TAB_META) as DraftTab[]).map((value) => {
              const { label, icon: Icon } = TAB_META[value];
              return (
                <TabsTrigger key={value} value={value} className="gap-1.5">
                  <Icon className="size-3.5" />
                  {label}
                  {counts[value] != null && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-xs tabular-nums",
                        value === "failed" && counts.failed
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {counts[value]}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="flex items-center gap-2">
            {tab === "review" && ready.length > 0 && (
              <Button
                variant="outline"
                onClick={saveReady}
                disabled={saveDraft.isPending}
              >
                <Check className="size-4" /> Guardar listos ({ready.length})
              </Button>
            )}
            {tab === "failed" && failed.length > 0 && (
              <Button
                variant="outline"
                onClick={retryAll}
                disabled={retryDraft.isPending}
              >
                <RotateCw className="size-4" /> Reintentar todos
              </Button>
            )}
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>
        {(["review", "failed", "discarded"] as const).map((value) => (
          <TabsContent key={value} value={value} className="mt-4 space-y-4">
            {value === "review" && review.length > 0 && (
              <DraftIndicators summary={summarizeDrafts(review)} />
            )}
            <DraftList tab={value} view={view} onEdit={setEditing} />
          </TabsContent>
        ))}
      </Tabs>
      <DraftEditDialog draft={editing} onClose={() => setEditing(undefined)} />
    </div>
  );
}

function DraftList({
  tab,
  view,
  onEdit,
}: {
  tab: DraftTab;
  view: ViewMode;
  onEdit: (draft: Draft) => void;
}) {
  const { data, isLoading } = useDrafts(tab);
  const personName = nameById(usePeople().data);
  const saveDraft = useSaveDraft();
  const discardDraft = useDiscardDraft();
  const retryDraft = useRetryDraft();

  if (isLoading) return null;
  const items = data?.items ?? [];
  if (!items.length) {
    if (tab === "review")
      return (
        <EmptyState
          tone="success"
          icon={Check}
          title="Todo al día"
          description="No hay gastos por revisar. Lo que registres por Mensajes o Importación llegará aquí."
          className="min-h-[50vh] border-transparent bg-transparent"
          action={
            <>
              <Button asChild>
                <a href="/mensajes">
                  <MessageSquare className="size-4" /> Ir a Mensajes
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/importacion">
                  <Upload className="size-4" /> Importar estado de cuenta
                </a>
              </Button>
            </>
          }
        />
      );
    return (
      <EmptyState
        description={tab === "failed" ? "Nada falló" : "No hay descartados"}
      />
    );
  }

  const columns: Column<Draft>[] = [
    {
      key: "concept",
      header: "Concepto",
      role: "title",
      cell: (draft) => (
        <div className="min-w-0 space-y-1">
          <p className="truncate font-medium">
            {draft.description ?? draft.rawText ?? "Sin descripción"}
          </p>
          {draft.rawText && draft.description && (
            <p className="line-clamp-2 text-xs italic text-muted-foreground">
              «{draft.rawText}»
            </p>
          )}
          {draft.missingFields.length > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Falta:{" "}
              {draft.missingFields
                .map((field) => FIELD_LABELS[field] ?? field)
                .join(", ")}
            </p>
          )}
        </div>
      ),
    },
    ...(tab === "review"
      ? [
          {
            key: "state",
            header: "Estado",
            cell: (draft: Draft) =>
              draft.missingFields.length ? (
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  Falta: {missingLabels(draft).join(", ").toLowerCase()}
                </span>
              ) : (
                <Badge variant="outline" className="text-emerald-600">
                  Listo
                </Badge>
              ),
          },
        ]
      : []),
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      cell: (draft) => (
        <span className="font-semibold tabular-nums">
          {draft.amount != null
            ? formatCurrency(draft.amount, draft.currency ?? "PEN")
            : "Sin monto"}
        </span>
      ),
    },
    {
      key: "destination",
      header: "Destino",
      cell: (draft) => (
        <span className="text-sm">
          {draft.destination
            ? (DESTINATION_LABELS[draft.destination] ?? draft.destination)
            : "—"}
        </span>
      ),
    },
    {
      key: "person",
      header: "Persona",
      cell: (draft) => (
        <span className="text-sm">
          {draft.personId ? personName(draft.personId) : "—"}
        </span>
      ),
    },
    {
      key: "shared",
      header: "Reparto",
      cell: (draft) =>
        draft.sharedWith?.shares.length && draft.amount != null ? (
          <span className="text-xs text-muted-foreground">
            👥{" "}
            {shareParts(draft.amount, draft.sharedWith.shares)
              .parts.map(
                (part) =>
                  `${personName(part.personId)} ${formatCurrency(part.amount, draft.currency ?? "PEN")} (${part.percent} %)`,
              )
              .join(" · ")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "origin",
      header: "Origen",
      cell: (draft) => {
        const ChannelIcon =
          CHANNEL_ICONS[draft.channel as keyof typeof CHANNEL_ICONS] ??
          MessageSquare;
        return (
          <span className="inline-flex flex-wrap items-center justify-end gap-2">
            <Badge variant="outline" className="gap-1">
              <ChannelIcon className="h-3 w-3" />
              {formatDate(draft.createdAt)}
            </Badge>
            {draftMediaKind(draft.inputType) && (
              <MediaLink
                draftId={draft.id}
                kind={draftMediaKind(draft.inputType)!}
              />
            )}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      cell: (draft) => (
        <div className="flex items-center justify-end gap-1">
          {tab === "failed" ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => retryDraft.mutate(draft.id)}
              disabled={retryDraft.isPending}
            >
              <RotateCw className="size-3.5" /> Reintentar
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => saveDraft.mutate(draft.id)}
              disabled={draft.missingFields.length > 0 || saveDraft.isPending}
            >
              <Check className="mr-1 h-3.5 w-3.5" /> Guardar
            </Button>
          )}
          <DraftActionsMenu
            draft={draft}
            tab={tab}
            label={draft.description ?? draft.rawText ?? "borrador"}
            onSave={() => saveDraft.mutate(draft.id)}
            onRetry={() => retryDraft.mutate(draft.id)}
            onEdit={() => onEdit(draft)}
            onDiscard={() => discardDraft.mutate(draft.id)}
          />
        </div>
      ),
    },
  ];

  const actionsColumn = columns[columns.length - 1];
  const failedColumns: Column<Draft>[] = [
    {
      key: "concept",
      header: "Descripción",
      role: "title",
      cell: (draft) => (
        <p className="truncate font-medium">
          {draft.description ?? draft.rawText ?? "Sin descripción"}
        </p>
      ),
    },
    {
      key: "reason",
      header: "Motivo",
      cell: (draft) => (
        <span className="text-xs text-destructive">{failureReason(draft)}</span>
      ),
    },
    columns.find((column) => column.key === "origin")!,
    {
      key: "date",
      header: "Fecha",
      cell: (draft) => (
        <span className="text-sm">{formatDate(draft.createdAt)}</span>
      ),
    },
    actionsColumn,
  ];

  if (tab === "failed")
    return (
      <DataView
        items={items}
        columns={failedColumns}
        rowKey={(draft) => draft.id}
        view={view}
        cardRenderer={(draft) => (
          <DraftFailedCard
            draft={draft}
            busy={retryDraft.isPending}
            onRetry={() => retryDraft.mutate(draft.id)}
            onWriteManually={() => onEdit(draft)}
            onDiscard={() => discardDraft.mutate(draft.id)}
          />
        )}
      />
    );

  const cardRows = (draft: Draft) =>
    columns
      .filter((column) =>
        ["destination", "person", "shared", "origin"].includes(column.key),
      )
      .map((column) => ({ label: column.header, value: column.cell(draft) }));

  return (
    <DataView
      items={items}
      columns={columns}
      rowKey={(draft) => draft.id}
      view={view}
      cardRenderer={(draft) => (
        <DraftCard
          draft={draft}
          rows={cardRows(draft)}
          discarded={tab === "discarded"}
          busy={saveDraft.isPending}
          onSave={() => saveDraft.mutate(draft.id)}
          onEdit={() => onEdit(draft)}
          onDiscard={() => discardDraft.mutate(draft.id)}
        />
      )}
      extraCard={
        tab === "review" ? (
          <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-4 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted/60">
              <Plus className="size-5" />
            </span>
            <b className="text-sm">Registrar más</b>
            <p className="text-xs text-muted-foreground">
              Escribe o envía una captura desde Mensajes
            </p>
            <Button asChild variant="outline" size="sm">
              <a href="/mensajes">
                <MessageSquare className="size-4" /> Ir a Mensajes
              </a>
            </Button>
          </div>
        ) : undefined
      }
    />
  );
}

function MediaLink({
  draftId,
  kind,
}: {
  draftId: string;
  kind: "image" | "audio";
}) {
  const openMedia = useOpenDraftMedia();
  const Icon = kind === "audio" ? Mic : ImageIcon;
  return (
    <button
      type="button"
      onClick={() => void openMedia(draftId)}
      className="flex items-center gap-1 text-xs text-primary hover:underline"
    >
      <Icon className="h-3.5 w-3.5" />{" "}
      {kind === "audio" ? "Escuchar nota de voz" : "Ver captura"}
    </button>
  );
}

function DraftEditDialog({
  draft,
  onClose,
}: {
  draft?: Draft;
  onClose: () => void;
}) {
  const updateDraft = useUpdateDraft();
  const [fields, setFields] = useState<DraftFields>({});

  useEffect(() => {
    if (draft) {
      setFields({
        destination: (draft.destination as DraftFields["destination"]) ?? null,
        description: draft.description,
        amount: draft.amount,
        currency: (draft.currency as DraftFields["currency"]) ?? "PEN",
        spentAt: draft.spentAt?.slice(0, 10) ?? null,
        expenseType: (draft.expenseType as DraftFields["expenseType"]) ?? null,
        installment: draft.installment,
        period: (draft.period as DraftFields["period"]) ?? null,
        personId: draft.personId,
        paymentMethodId: draft.paymentMethodId,
        categoryId: draft.categoryId,
        merchant: draft.merchant,
        operationNumber: draft.operationNumber,
        notes: draft.notes,
        sharedWith: draft.sharedWith?.shares.length ? draft.sharedWith : null,
      });
    }
  }, [draft]);

  const save = () => {
    if (!draft) return;
    updateDraft.mutate(
      { id: draft.id, body: toDraftBody(fields) },
      { onSuccess: onClose },
    );
  };

  return (
    <ResponsiveDialog
      open={!!draft}
      onOpenChange={(open) => !open && onClose()}
      title="Editar borrador"
      description="Queda en Por revisar hasta que lo guardes"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={updateDraft.isPending}>
            Guardar cambios
          </Button>
        </>
      }
    >
      <DraftForm
        value={fields}
        onChange={setFields}
        missingFields={draft?.missingFields}
      />
    </ResponsiveDialog>
  );
}

export const DraftsPage = withQuery(DraftsPageView);
