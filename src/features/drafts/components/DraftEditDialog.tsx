import { useEffect, useState } from "react";
import { Button } from "@/ui/button";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { formatDate } from "@/shared/lib/dates";
import {
  useDiscardDraft,
  useSaveDraft,
  useUpdateDraft,
  type DraftFields,
} from "@/features/drafts/hooks/drafts";
import { DESTINATION_LABELS } from "@/features/drafts/constants/destinations";
import { toDraftBody } from "@/features/drafts/lib/draft-form";
import { originLabel } from "@/features/drafts/lib/draft-filters";
import { DraftForm } from "./DraftForm";

interface EditableDraft {
  id: string;
  channel: string;
  createdAt: string;
  rawText: string | null;
  missingFields: string[];
  destination: string | null;
  description: string | null;
  amount: number | null;
  currency: string | null;
  spentAt: string | null;
  expenseType: string | null;
  installment: DraftFields["installment"];
  period: string | null;
  personId: string | null;
  paymentMethodId: string | null;
  categoryId: string | null;
  merchant: string | null;
  operationNumber: string | null;
  notes: string | null;
  sharedWith: DraftFields["sharedWith"] | null;
}

// Completar / Editar borrador (board B4): Guardar completa los datos y, si ya está todo, lo guarda en su destino
export function DraftEditDialog({
  draft,
  onClose,
}: {
  draft?: EditableDraft;
  onClose: () => void;
}) {
  const updateDraft = useUpdateDraft();
  const saveDraft = useSaveDraft();
  const discardDraft = useDiscardDraft();
  const [fields, setFields] = useState<DraftFields>({});
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    if (!draft) return;
    setMissing(draft.missingFields);
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
      sharedWith: draft.sharedWith?.shares?.length ? draft.sharedWith : null,
    });
  }, [draft]);

  const busy =
    updateDraft.isPending || saveDraft.isPending || discardDraft.isPending;

  // Guarda los cambios; si la API ya no ve campos faltantes, lo manda a su destino
  const save = async () => {
    if (!draft) return;
    try {
      const updated = await updateDraft.mutateAsync({
        id: draft.id,
        body: toDraftBody(fields),
      });
      const stillMissing =
        (updated as { missingFields?: string[] } | undefined)?.missingFields ??
        [];
      setMissing(stillMissing);
      if (stillMissing.length === 0) {
        await saveDraft.mutateAsync(draft.id);
        onClose();
      }
    } catch {
      // The mutations report their own error; the dialog stays open to retry.
    }
  };
  const discard = async () => {
    if (!draft) return;
    try {
      await discardDraft.mutateAsync(draft.id);
      onClose();
    } catch {
      // Reported by the mutation.
    }
  };

  const incomplete = (draft?.missingFields.length ?? 0) > 0;
  const where = fields.destination
    ? (DESTINATION_LABELS[fields.destination] ?? fields.destination)
    : null;

  return (
    <ResponsiveDialog
      open={!!draft}
      onOpenChange={(open) => !open && onClose()}
      title={incomplete ? "Completar borrador" : "Editar borrador"}
      description={
        draft
          ? `${originLabel(draft.channel)} · ${formatDate(draft.createdAt)}${draft.rawText ? ` · «${draft.rawText}»` : ""}`
          : undefined
      }
      footer={
        <>
          <Button
            variant="ghost"
            className="mr-auto text-destructive hover:text-destructive"
            onClick={() => void discard()}
            disabled={busy}
          >
            Descartar
          </Button>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={() => void save()} disabled={busy}>
            Guardar
          </Button>
        </>
      }
    >
      <DraftForm value={fields} onChange={setFields} missingFields={missing} />
      {where && (
        <p className="mt-3 text-xs text-muted-foreground">
          Se guardará en {where}
        </p>
      )}
    </ResponsiveDialog>
  );
}
