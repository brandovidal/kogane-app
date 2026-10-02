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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general"><ReceiptText aria-hidden="true" />General</TabsTrigger>
              <TabsTrigger value="schedule"><CalendarClock aria-hidden="true" />Programación</TabsTrigger>
              <TabsTrigger value="notes"><NotebookPen aria-hidden="true" />Notas y archivos</TabsTrigger>
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
