import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DraftForm } from "@/features/drafts/components/DraftForm";
import { emptyDraftFields, toDraftBody } from "@/features/drafts/draft-form";
import { ApiError } from "@/shared/api/client";
import { useCreditCards } from "@/shared/api/hooks/catalogs";
import { useCreateDraft, useSaveDraft, type DraftFields } from "@/shared/api/hooks/drafts";
import { withQuery } from "@/shared/api/query";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { DESTINATION_LABELS } from "@/shared/labels";
import { useNewExpense } from "@/shared/stores/new-expense.store";
import { Button } from "@/ui/button";

// Where each destination is listed, for "Ver" after saving
function pageOf(fields: DraftFields, cardCode: (id: string | null | undefined) => string | undefined): string {
  switch (fields.destination) {
    case "fixed_cost":
      return "/costos-fijos";
    case "subscription":
      return "/plataformas";
    case "credit_card":
      return `/tarjetas/${cardCode(fields.paymentMethodId) ?? ""}`;
    case "receivable":
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
  const [fields, setFields] = useState<DraftFields>(emptyDraftFields);
  const [missing, setMissing] = useState<string[]>([]);
  const createDraft = useCreateDraft();
  const saveDraft = useSaveDraft({ quiet: true });

  useEffect(() => {
    if (open) {
      setFields({ ...emptyDraftFields(), ...preset });
      setMissing([]);
    }
  }, [open, preset]);

  const save = async () => {
    const body = toDraftBody(fields);
    try {
      const draft = await createDraft.mutateAsync(body);
      if (draft && draft.missingFields.length) {
        setMissing(draft.missingFields);
        toast.info("Faltan datos: quedó en Borrador para completarlo.", {
          action: { label: "Borrador", onClick: () => window.location.assign("/borrador") },
        });
        return;
      }
      if (draft) await saveDraft.mutateAsync(draft.id);
      const cardCode = (id: string | null | undefined) => cards.find((card) => card.id === id)?.code ?? undefined;
      const label = DESTINATION_LABELS[fields.destination ?? "daily"] ?? "Gastos";
      toast.success(`Guardado en ${label}`, {
        action: { label: "Ver", onClick: () => window.location.assign(pageOf(fields, cardCode)) },
      });
      close();
    } catch (error) {
      if (error instanceof ApiError && error.code === "EXPENSE_NOT_SAVEABLE") {
        toast.info("Quedó en Borrador para completarlo.");
        close();
      }
    }
  };

  const busy = createDraft.isPending || saveDraft.isPending;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(value) => !value && close()}
      title="Nuevo gasto"
      description="Pagas tú; si lo compartes, agrega el reparto."
      footer={
        <>
          <Button variant="outline" onClick={close}>Cancelar</Button>
          <Button onClick={save} disabled={busy}>{busy ? "Guardando..." : "Guardar"}</Button>
        </>
      }
    >
      <DraftForm value={fields} onChange={setFields} missingFields={missing} />
      <p className="pt-2 text-xs text-muted-foreground">
        ¿Tienes una captura, un audio o un texto? Usa <a href="/mensajes" className="text-primary underline">Mensajes</a>.
      </p>
    </ResponsiveDialog>
  );
}

export const NewExpenseDialog = withQuery(NewExpenseDialogView);
