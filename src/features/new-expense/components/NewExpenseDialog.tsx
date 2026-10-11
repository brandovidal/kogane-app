import { cardHref } from "@/features/credit-cards/lib/card-links";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, Plus, ReceiptText } from "lucide-react";

import { DraftForm } from "@/features/drafts/components/DraftForm";
import {
  emptyDraftFields,
  FORM_DESTINATIONS,
  toDraftBody,
} from "@/features/drafts/lib/draft-form";
import { ApiError } from "@/shared/api/client";
import { useCreditCards } from "@/shared/api/hooks/catalogs";
import {
  useCreateDraft,
  useSaveDraft,
  type DraftFields,
} from "@/features/drafts/hooks/drafts";
import { withQuery } from "@/shared/api/query";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { DESTINATION_LABELS } from "@/features/drafts/constants/destinations";
import { useNewExpense } from "@/features/new-expense/stores/new-expense.store";
import { Button } from "@/ui/button";
import { installmentError } from "@/features/expenses/lib/installments";
import { FIELDS_BY_DESTINATION } from "@/features/drafts/lib/draft-form";
import { usePeriod } from "@/shared/stores/period.store";
import { useUploadAttachment } from "@/features/attachments/hooks/attachments";
import { ATTACHMENT_MAX_MB } from "@/features/attachments/constants/attachments";
import type { PendingAttachmentUpload } from "@/features/attachments/types/pending-attachment-upload";
import { getMonthName } from "@/shared/lib/dates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

// Where each destination is listed, for "Ver" after saving
function pageOf(
  fields: DraftFields,
  cardCode: (id: string | null | undefined) => string | undefined,
): string {
  switch (fields.destination) {
    case "fixed_cost":
      return "/costos-fijos";
    case "subscription":
      return "/plataformas";
    case "credit_card":
      return cardHref(cardCode(fields.paymentMethodId));
    case "receivable":
      return "/cobros";
    case "payable":
      return "/deudas";
    default:
      return "/dia-a-dia";
  }
}

// Nuevo gasto (D40, D79): the form of each destination with its split; it saves through a draft like the bot (D57)
// and stays in Borrador when something is missing. Screenshots, voice notes and free text go through Mensajes.
function NewExpenseDialogView() {
  const open = useNewExpense((state) => state.open);
  const preset = useNewExpense((state) => state.preset);
  const close = useNewExpense((state) => state.close);
  const cards = useCreditCards().data ?? [];
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const [fields, setFields] = useState<DraftFields>(emptyDraftFields);
  const [missing, setMissing] = useState<string[]>([]);
  const createDraft = useCreateDraft();
  const saveDraft = useSaveDraft({ quiet: true });
  const uploadAttachment = useUploadAttachment({ quiet: true });
  const [pendingAttachments, setPendingAttachments] = useState<
    PendingAttachmentUpload[]
  >([]);
  const [savedRecordId, setSavedRecordId] = useState<string>();

  useEffect(() => {
    if (open) {
      setFields({ ...emptyDraftFields(), ...preset });
      setMissing([]);
      setPendingAttachments([]);
      setSavedRecordId(undefined);
    }
  }, [open, preset]);

  const save = async () => {
    if (savedRecordId) {
      const results = await Promise.allSettled(
        pendingAttachments.map((pending) =>
          uploadAttachment.mutateAsync({
            file: pending.file,
            refType: "expense",
            refId: savedRecordId,
            kind: pending.kind,
          }),
        ),
      );
      const failed = pendingAttachments.filter(
        (_, index) => results[index]?.status === "rejected",
      );
      setPendingAttachments(failed);
      if (failed.length) {
        toast.error(
          "El gasto ya se creó, pero algunos archivos no se subieron. Puedes reintentarlo.",
        );
        return;
      }
      toast.success("Gasto y archivos guardados");
      close();
      return;
    }
    const oversized = pendingAttachments.some(
      ({ file }) => file.size > ATTACHMENT_MAX_MB * 1024 * 1024,
    );
    if (oversized) {
      toast.error(`Cada archivo debe pesar ${ATTACHMENT_MAX_MB} MB o menos.`);
      return;
    }
    const rules = FIELDS_BY_DESTINATION[fields.destination ?? "daily"];
    const quotaError = rules?.installment
      ? installmentError(fields.installment)
      : undefined;
    if (quotaError) {
      setMissing(["installment"]);
      toast.error(quotaError);
      return;
    }
    const body = toDraftBody(fields);
    try {
      const draft = await createDraft.mutateAsync(body);
      if (draft && draft.missingFields.length) {
        setMissing(draft.missingFields);
        toast.info("Faltan datos: quedó en Borrador para completarlo.", {
          action: {
            label: "Borrador",
            onClick: () => window.location.assign("/borrador"),
          },
        });
        return;
      }
      if (draft) {
        const saved = await saveDraft.mutateAsync(draft.id);
        if (pendingAttachments.length) {
          setSavedRecordId(saved.recordId);
          const results = await Promise.allSettled(
            pendingAttachments.map((pending) =>
              uploadAttachment.mutateAsync({
                file: pending.file,
                refType: "expense",
                refId: saved.recordId,
                kind: pending.kind,
              }),
            ),
          );
          const failed = pendingAttachments.filter(
            (_, index) => results[index]?.status === "rejected",
          );
          setPendingAttachments(failed);
          if (failed.length) {
            toast.error(
              "El gasto ya se creó, pero algunos archivos no se subieron. Puedes reintentarlo.",
            );
            return;
          }
        }
      }
      const cardCode = (id: string | null | undefined) =>
        cards.find((card) => card.id === id)?.code ?? undefined;
      const label =
        DESTINATION_LABELS[fields.destination ?? "daily"] ?? "Gastos";
      toast.success(`Guardado en ${label}`, {
        action: {
          label: "Ver",
          onClick: () => window.location.assign(pageOf(fields, cardCode)),
        },
      });
      close();
    } catch (error) {
      if (error instanceof ApiError && error.code === "EXPENSE_NOT_SAVEABLE") {
        toast.info("Quedó en Borrador para completarlo.");
        close();
      }
    }
  };

  const busy =
    createDraft.isPending || saveDraft.isPending || uploadAttachment.isPending;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(value) => !value && close()}
      title="Nuevo gasto"
      icon={<ReceiptText aria-hidden="true" className="size-4 text-primary" />}
      description={`${getMonthName(month)} ${year} · se registrará en este período`}
      headerActions={
        <Select
          value={fields.destination ?? "daily"}
          onValueChange={(destination) =>
            setFields({
              ...fields,
              destination: destination as DraftFields["destination"],
            })
          }
        >
          <SelectTrigger
            aria-label="Destino del gasto"
            className="h-9 w-[170px] shrink-0 rounded-full"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {FORM_DESTINATIONS.map((destination) => (
              <SelectItem key={destination} value={destination}>
                {DESTINATION_LABELS[destination]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
      contentClassName="sm:max-w-5xl max-h-[92vh]"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <p className="hidden text-xs text-muted-foreground sm:block">
            <kbd className="rounded border px-1.5 py-0.5">⌘</kbd>{" "}
            <kbd className="rounded border px-1.5 py-0.5">Enter</kbd> para crear
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={close}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : (
                <Plus aria-hidden="true" />
              )}
              {busy
                ? savedRecordId
                  ? "Subiendo archivos..."
                  : "Creando..."
                : savedRecordId
                  ? "Reintentar archivos"
                  : "Crear"}
            </Button>
          </div>
        </div>
      }
    >
      <div
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            void save();
          }
        }}
      >
        <DraftForm
          key={open ? "open" : "closed"}
          value={fields}
          onChange={setFields}
          missingFields={missing}
          showDestinationField={false}
          files={pendingAttachments}
          onFilesChange={setPendingAttachments}
        />
      </div>
    </ResponsiveDialog>
  );
}

export const NewExpenseDialog = withQuery(NewExpenseDialogView);
