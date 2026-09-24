import { useEffect, useState } from "react";
import { shareParts } from "@/shared/lib/shared-expense";
import { toast } from "sonner";
import { Check, ImageIcon, Mic, MessageSquare, Pencil, RotateCw, Send, X } from "lucide-react";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { EmptyState } from "@/shared/components/EmptyState";
import { DataView, useViewMode, ViewToggle, type Column, type ViewMode } from "@/shared/components/DataView";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { api, unwrap } from "@/shared/api/client";
import { nameById, usePeople } from "@/shared/api/hooks/catalogs";
import {
  useDiscardDraft,
  useDrafts,
  useRetryDraft,
  useSaveDraft,
  useUpdateDraft,
  type DraftFields,
  type DraftTab,
} from "@/shared/api/hooks/drafts";
import { errorMessage } from "@/shared/api/hooks/use-api-mutation";
import { withQuery } from "@/shared/api/query";
import type { Schemas } from "@/shared/api/client";
import { DESTINATION_LABELS } from "@/shared/labels";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { toDraftBody } from "../draft-form";
import { DraftForm } from "./DraftForm";

type Draft = NonNullable<Schemas["DraftListResponseDto"]["data"]>["items"][number];

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

// Borrador (D50): what the bot or the web could not save yet. Por revisar · Fallidos · Descartados
function DraftsPageView() {
  const [tab, setTab] = useState<DraftTab>("review");
  const [editing, setEditing] = useState<Draft | undefined>();
  const [view, setView] = useViewMode("drafts", "cards");

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(value) => setTab(value as DraftTab)}>
        <div className="flex items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="review">Por revisar</TabsTrigger>
            <TabsTrigger value="failed">Fallidos</TabsTrigger>
            <TabsTrigger value="discarded">Descartados</TabsTrigger>
          </TabsList>
          <ViewToggle value={view} onChange={setView} />
        </div>
        {(["review", "failed", "discarded"] as const).map((value) => (
          <TabsContent key={value} value={value} className="mt-4">
            <DraftList tab={value} view={view} onEdit={setEditing} />
          </TabsContent>
        ))}
      </Tabs>
      <DraftEditDialog draft={editing} onClose={() => setEditing(undefined)} />
    </div>
  );
}

function DraftList({ tab, view, onEdit }: { tab: DraftTab; view: ViewMode; onEdit: (draft: Draft) => void }) {
  const { data, isLoading } = useDrafts(tab);
  const personName = nameById(usePeople().data);
  const saveDraft = useSaveDraft();
  const discardDraft = useDiscardDraft();
  const retryDraft = useRetryDraft();

  if (isLoading) return null;
  const items = data?.items ?? [];
  if (!items.length) {
    const empty = { review: "Nada pendiente de revisar 🎉", failed: "Nada falló", discarded: "No hay descartados" };
    return <EmptyState description={empty[tab]} />;
  }

  const columns: Column<Draft>[] = [
    {
      key: "concept",
      header: "Concepto",
      role: "title",
      cell: (draft) => (
        <div className="min-w-0 space-y-1">
          <p className="truncate font-medium">{draft.description ?? draft.rawText ?? "Sin descripción"}</p>
          {draft.rawText && draft.description && (
            <p className="line-clamp-2 text-xs italic text-muted-foreground">«{draft.rawText}»</p>
          )}
          {draft.missingFields.length > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Falta: {draft.missingFields.map((field) => FIELD_LABELS[field] ?? field).join(", ")}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      cell: (draft) => (
        <span className="font-semibold tabular-nums">
          {draft.amount != null ? formatCurrency(draft.amount, draft.currency ?? "PEN") : "Sin monto"}
        </span>
      ),
    },
    {
      key: "destination",
      header: "Destino",
      cell: (draft) => <span className="text-sm">{draft.destination ? (DESTINATION_LABELS[draft.destination] ?? draft.destination) : "—"}</span>,
    },
    { key: "person", header: "Persona", cell: (draft) => <span className="text-sm">{draft.personId ? personName(draft.personId) : "—"}</span> },
    {
      key: "shared",
      header: "Reparto",
      cell: (draft) =>
        draft.sharedWith?.shares.length && draft.amount != null ? (
          <span className="text-xs text-muted-foreground">
            👥{" "}
            {shareParts(draft.amount, draft.sharedWith.shares)
              .parts.map((part) => `${personName(part.personId)} ${formatCurrency(part.amount, draft.currency ?? "PEN")} (${part.percent} %)`)
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
        const ChannelIcon = CHANNEL_ICONS[draft.channel as keyof typeof CHANNEL_ICONS] ?? MessageSquare;
        return (
          <span className="inline-flex flex-wrap items-center justify-end gap-2">
            <Badge variant="outline" className="gap-1">
              <ChannelIcon className="h-3 w-3" />
              {formatDate(draft.createdAt)}
            </Badge>
            {draft.inputType !== "text" && draft.inputType !== "manual" && (
              <MediaLink draftId={draft.id} kind={draft.inputType === "audio" ? "audio" : "image"} />
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
        <div className="flex flex-wrap justify-end gap-1">
          {tab === "failed" ? (
            <Button size="sm" variant="outline" onClick={() => retryDraft.mutate(draft.id)} disabled={retryDraft.isPending}>
              <RotateCw className="mr-1 h-3.5 w-3.5" /> Reintentar
            </Button>
          ) : (
            <Button size="sm" onClick={() => saveDraft.mutate(draft.id)} disabled={draft.missingFields.length > 0 || saveDraft.isPending}>
              <Check className="mr-1 h-3.5 w-3.5" /> Guardar
            </Button>
          )}
          <Button size="sm" variant="outline" aria-label="Editar" onClick={() => onEdit(draft)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {tab !== "discarded" && (
            <Button size="sm" variant="ghost" className="text-destructive" aria-label="Descartar" onClick={() => discardDraft.mutate(draft.id)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return <DataView items={items} columns={columns} rowKey={(draft) => draft.id} view={view} />;
}

// The screenshot or voice note lives in R2 (D58): a 10 minute link is asked for only when opened
function MediaLink({ draftId, kind }: { draftId: string; kind: "image" | "audio" }) {
  const open = async () => {
    try {
      const draft = await unwrap(api.GET("/v1/drafts/{id}", { params: { path: { id: draftId } } }));
      if (draft.mediaUrl) window.open(draft.mediaUrl, "_blank", "noopener");
      else toast.info("El archivo ya expiró (7 días) o no se guardó.");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  const Icon = kind === "audio" ? Mic : ImageIcon;
  return (
    <button type="button" onClick={open} className="flex items-center gap-1 text-xs text-primary hover:underline">
      <Icon className="h-3.5 w-3.5" /> {kind === "audio" ? "Escuchar nota de voz" : "Ver captura"}
    </button>
  );
}

function DraftEditDialog({ draft, onClose }: { draft?: Draft; onClose: () => void }) {
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
    updateDraft.mutate({ id: draft.id, body: toDraftBody(fields) }, { onSuccess: onClose });
  };

  return (
    <ResponsiveDialog
      open={!!draft}
      onOpenChange={(open) => !open && onClose()}
      title="Editar borrador"
      description="Queda en Por revisar hasta que lo guardes"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={updateDraft.isPending}>Guardar cambios</Button>
        </>
      }
    >
      <DraftForm value={fields} onChange={setFields} missingFields={draft?.missingFields} />
    </ResponsiveDialog>
  );
}

export const DraftsPage = withQuery(DraftsPageView);
