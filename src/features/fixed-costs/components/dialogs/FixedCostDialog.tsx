import { FormProvider } from "react-hook-form";
import { CalendarClock, LoaderCircle, NotebookPen, Plus, ReceiptText, Save } from "lucide-react";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { getMonthName } from "@/shared/lib/dates";
import { useFixedCostForm, type FixedCostDialogProps } from "../../hooks/useFixedCostForm";
import { FIXED_COST_SCHEDULE_FIELDS } from "../../lib/fixed-cost-form";
import { FixedCostGeneralSection } from "../../sections/form/FixedCostGeneralSection";
import { FixedCostNotesSection } from "../../sections/form/FixedCostNotesSection";
import { FixedCostScheduleSection } from "../../sections/form/FixedCostScheduleSection";

export function FixedCostDialog(props: FixedCostDialogProps) {
  const { form, activeTab, setActiveTab, onSubmit, isEdit, isSaving, fixedCostId, pendingAttachments, setPendingAttachments, retryPendingAttachments, isUploadingAttachments } = useFixedCostForm(props);
  const errors = form.formState.errors;
  const hasScheduleErrors = Object.keys(errors).some((field) =>
    FIXED_COST_SCHEDULE_FIELDS.includes(field),
  );
  const hasGeneralErrors = Object.keys(errors).length > 0 && !hasScheduleErrors;
  const paymentMonth = form.watch("paymentMonth");
  const paymentYear = form.watch("paymentYear");

  return (
    <ResponsiveDialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={isEdit ? `Editar · ${form.watch("description") || "gasto fijo"}` : "Nuevo gasto fijo"}
      icon={<ReceiptText aria-hidden="true" className="size-4 text-primary" />}
      description={isEdit ? "Modifica los datos del gasto" : `${getMonthName(paymentMonth)} ${paymentYear} · se registrará en este período`}
      contentClassName="sm:max-w-2xl max-h-[92dvh]"
      footer={
        <>
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={isSaving}>
            {isSaving ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : isEdit ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {isEdit ? "Guardar" : "Crear"}
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form className="space-y-1" onSubmit={onSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start gap-1 overflow-x-auto overscroll-x-contain scrollbar-none sm:grid sm:grid-cols-3 sm:overflow-visible">
              <TabsTrigger value="general" className="min-w-max flex-none px-3 text-xs sm:min-w-0 sm:flex-1 sm:px-2 sm:text-sm"><ReceiptText aria-hidden="true" className="size-4" />General{hasGeneralErrors && <span aria-label="Hay errores en esta pestaña" className="size-1.5 rounded-full bg-destructive" />}</TabsTrigger>
              <TabsTrigger value="schedule" className="min-w-max flex-none px-3 text-xs sm:min-w-0 sm:flex-1 sm:px-2 sm:text-sm"><CalendarClock aria-hidden="true" className="size-4" />Programación{hasScheduleErrors && <span aria-label="Hay errores en esta pestaña" className="size-1.5 rounded-full bg-destructive" />}</TabsTrigger>
              <TabsTrigger value="notes" className="min-w-max flex-none px-3 text-xs sm:min-w-0 sm:flex-1 sm:px-2 sm:text-sm"><NotebookPen aria-hidden="true" className="size-4" /><span className="sm:hidden">Archivos</span><span className="hidden sm:inline">Notas y archivos</span>{pendingAttachments.length > 0 && <span className="inline-flex size-4 items-center justify-center rounded-full bg-muted text-[10px]">{pendingAttachments.length}</span>}</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="py-3"><FixedCostGeneralSection /></TabsContent>
            <TabsContent value="schedule" className="py-3"><FixedCostScheduleSection /></TabsContent>
            <TabsContent value="notes" className="py-3"><FixedCostNotesSection fixedCostId={fixedCostId} pendingAttachments={pendingAttachments} onPendingAttachmentsChange={setPendingAttachments} onRetryPendingAttachments={retryPendingAttachments} retryingAttachments={isUploadingAttachments} /></TabsContent>
          </Tabs>
        </form>
      </FormProvider>
    </ResponsiveDialog>
  );
}
