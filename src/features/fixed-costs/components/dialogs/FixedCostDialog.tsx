import { FormProvider, useWatch } from "react-hook-form";
import { CalendarClock, LoaderCircle, NotebookPen, Plus, ReceiptText, Save } from "lucide-react";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { useCategories, usePeople } from "@/shared/api/hooks/catalogs";
import { ATTACHMENT_MAX_MB } from "@/features/attachments/constants/attachments";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { useFixedCostForm, type FixedCostDialogProps } from "../../hooks/useFixedCostForm";
import { FIXED_COST_SCHEDULE_FIELDS } from "../../lib/fixed-cost-form";
import { FixedCostGeneralSection } from "../../sections/form/FixedCostGeneralSection";
import { FixedCostNotesSection } from "../../sections/form/FixedCostNotesSection";
import { FixedCostScheduleSection } from "../../sections/form/FixedCostScheduleSection";

export function FixedCostDialog(props: FixedCostDialogProps) {
  const { form, activeTab, setActiveTab, onSubmit, isEdit, isSaving, fixedCostId, pendingAttachments, setPendingAttachments, retryPendingAttachments, isUploadingAttachments, uploadingAttachmentIds, hasInvalidAttachments, invalidSavedUploadCount, setInvalidSavedUploads } = useFixedCostForm(props);
  const errors = form.formState.errors;
  const hasScheduleErrors = Object.keys(errors).some((field) =>
    FIXED_COST_SCHEDULE_FIELDS.includes(field),
  );
  const hasGeneralErrors = Object.keys(errors).length > 0 && !hasScheduleErrors;
  const [description, amount, currency, categoryId, personId] = useWatch({
    control: form.control,
    name: ["description", "amount", "currency", "categoryId", "personId"],
  });
  const paymentMonth = form.watch("paymentMonth");
  const paymentYear = form.watch("paymentYear");
  const isDirty = form.formState.isDirty;
  const categories = useCategories().data;
  const people = usePeople().data;
  const categoryName = categories?.find((category) => category.id === categoryId)?.name;
  const personName = people?.find((person) => person.id === personId)?.name;
  const costName = description?.trim();
  const costSummary = [
    Number.isFinite(amount) && amount > 0 ? formatCurrency(amount, currency) : "Monto pendiente",
    categoryName ?? "Categoría pendiente",
    personName ?? "Persona pendiente",
  ].join(" · ");
  const hasCostDetails = !!costName || (Number.isFinite(amount) && amount > 0) || !!categoryId || !!personId;
  const headerDescription = !isEdit && !hasCostDetails
    ? `${getMonthName(paymentMonth)} ${paymentYear} · se registrará en este período`
    : costSummary;

  return (
    <ResponsiveDialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={isEdit ? `Editar · ${costName || "gasto fijo"}` : `Nuevo gasto fijo${costName ? ` · ${costName}` : ""}`}
      icon={<ReceiptText aria-hidden="true" className="size-4 text-primary" />}
      description={headerDescription}
      contentClassName="sm:max-w-2xl max-h-[92dvh] bg-card"
      overlayClassName="fixed-costs-dialog-overlay"
      footer={
        <div className="flex w-full flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <span className="text-xs text-muted-foreground">
            {hasInvalidAttachments
              ? `Comprime o reemplaza los archivos que exceden ${ATTACHMENT_MAX_MB} MB`
              : isEdit ? (isDirty ? "Cambios sin guardar" : "") : "⌘ Enter para crear"}
          </span>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => props.onOpenChange(false)}>Cancelar</Button>
            <Button onClick={onSubmit} disabled={isSaving || hasInvalidAttachments}>
              {isSaving ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : isEdit ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
              {isEdit ? "Guardar" : "Crear"}
            </Button>
          </div>
        </div>
      }
    >
      <FormProvider {...form}>
        <form
          className="space-y-1"
          onSubmit={onSubmit}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && !isEdit) {
              event.preventDefault();
              void onSubmit();
            }
          }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start gap-1 overflow-x-auto overscroll-x-contain scrollbar-none sm:grid sm:grid-cols-3 sm:overflow-visible">
              <TabsTrigger value="general" className="min-w-max flex-none px-3 text-xs sm:min-w-0 sm:flex-1 sm:px-2 sm:text-sm"><ReceiptText aria-hidden="true" className="size-4" />General{hasGeneralErrors && <span aria-label="Hay errores en esta pestaña" className="size-1.5 rounded-full bg-destructive" />}</TabsTrigger>
              <TabsTrigger value="schedule" className="min-w-max flex-none px-3 text-xs sm:min-w-0 sm:flex-1 sm:px-2 sm:text-sm"><CalendarClock aria-hidden="true" className="size-4" />Programación{hasScheduleErrors && <span aria-label="Hay errores en esta pestaña" className="size-1.5 rounded-full bg-destructive" />}</TabsTrigger>
              <TabsTrigger value="notes" className="min-w-max flex-none px-3 text-xs sm:min-w-0 sm:flex-1 sm:px-2 sm:text-sm"><NotebookPen aria-hidden="true" className="size-4" /><span className="sm:hidden">Archivos</span><span className="hidden sm:inline">Notas y archivos</span>{pendingAttachments.length + invalidSavedUploadCount > 0 && <span className="inline-flex size-4 items-center justify-center rounded-full bg-muted text-[10px]">{pendingAttachments.length + invalidSavedUploadCount}</span>}</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="py-3"><FixedCostGeneralSection /></TabsContent>
            <TabsContent value="schedule" className="py-3"><FixedCostScheduleSection /></TabsContent>
            <TabsContent value="notes" forceMount className="py-3 data-[state=inactive]:hidden"><FixedCostNotesSection key={`${fixedCostId ?? "new"}:${props.open}`} fixedCostId={fixedCostId} pendingAttachments={pendingAttachments} onPendingAttachmentsChange={setPendingAttachments} onRetryPendingAttachments={retryPendingAttachments} retryingAttachments={isUploadingAttachments} uploadingAttachmentIds={uploadingAttachmentIds} onInvalidSavedUploadsChange={setInvalidSavedUploads} /></TabsContent>
          </Tabs>
        </form>
      </FormProvider>
    </ResponsiveDialog>
  );
}
