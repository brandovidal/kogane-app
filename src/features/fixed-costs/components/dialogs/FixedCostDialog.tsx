import { FormProvider } from "react-hook-form";
import { CalendarClock, LoaderCircle, NotebookPen, Plus, ReceiptText, Save } from "lucide-react";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { useFixedCostForm, type FixedCostDialogProps } from "../../hooks/useFixedCostForm";
import { FixedCostGeneralSection } from "../../sections/form/FixedCostGeneralSection";
import { FixedCostNotesSection } from "../../sections/form/FixedCostNotesSection";
import { FixedCostScheduleSection } from "../../sections/form/FixedCostScheduleSection";

export function FixedCostDialog(props: FixedCostDialogProps) {
  const { form, activeTab, setActiveTab, onSubmit, isEdit, isSaving, fixedCostId, pendingAttachments, setPendingAttachments, retryPendingAttachments, isUploadingAttachments } = useFixedCostForm(props);

  return (
    <ResponsiveDialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={isEdit ? "Editar gasto fijo" : "Nuevo gasto fijo"}
      icon={<ReceiptText aria-hidden="true" className="size-4 text-primary" />}
      description={isEdit ? "Modifica los datos del gasto" : "Agrega un nuevo costo fijo"}
      contentClassName="sm:max-w-2xl max-h-[92vh]"
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
        <form className="py-2" onSubmit={onSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start gap-1 overflow-x-auto overscroll-x-contain scrollbar-none sm:grid sm:grid-cols-3 sm:overflow-visible">
              <TabsTrigger value="general" className="min-w-max flex-none px-3 text-xs sm:min-w-0 sm:flex-1 sm:px-2 sm:text-sm"><ReceiptText aria-hidden="true" />General</TabsTrigger>
              <TabsTrigger value="schedule" className="min-w-max flex-none px-3 text-xs sm:min-w-0 sm:flex-1 sm:px-2 sm:text-sm"><CalendarClock aria-hidden="true" />Programación</TabsTrigger>
              <TabsTrigger value="notes" className="min-w-max flex-none px-3 text-xs sm:min-w-0 sm:flex-1 sm:px-2 sm:text-sm"><NotebookPen aria-hidden="true" /><span className="sm:hidden">Archivos</span><span className="hidden sm:inline">Notas y archivos</span></TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="py-4"><FixedCostGeneralSection /></TabsContent>
            <TabsContent value="schedule" className="py-4"><FixedCostScheduleSection /></TabsContent>
            <TabsContent value="notes" className="py-4"><FixedCostNotesSection fixedCostId={fixedCostId} pendingAttachments={pendingAttachments} onPendingAttachmentsChange={setPendingAttachments} onRetryPendingAttachments={retryPendingAttachments} retryingAttachments={isUploadingAttachments} /></TabsContent>
          </Tabs>
        </form>
      </FormProvider>
    </ResponsiveDialog>
  );
}
