import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMutating } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUploadAttachment } from "@/features/attachments/hooks/attachments";
import { ATTACHMENT_MAX_MB } from "@/features/attachments/constants/attachments";
import type { PendingAttachmentUpload } from "@/features/attachments/types/pending-attachment-upload";
import { useExpense, useSaveExpense } from "@/features/expenses/hooks/expenses";
import { attachmentKeys } from "@/features/attachments/constants/query-keys";
import type { AttachmentUpload } from "@/features/attachments/hooks/attachments";
import { EXPENSE_RESOURCES, type FixedCost } from "@/shared/api/types";
import { usePeriod } from "@/shared/stores/period.store";
import {
  fixedCostFormDefaults,
  fixedCostFormSchema,
  fixedCostSaveBody,
  FIXED_COST_SCHEDULE_FIELDS,
  type FixedCostForm,
  type FixedCostValues,
} from "@/features/fixed-costs/lib/fixed-cost-form";

export interface FixedCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fixedCost?: FixedCost;
}

export function useFixedCostForm({
  open,
  onOpenChange,
  fixedCost,
}: FixedCostDialogProps) {
  const saveExpense = useSaveExpense(EXPENSE_RESOURCES.fixedCost);
  const uploadAttachment = useUploadAttachment({ quiet: true });
  const currentCost = useExpense(
    EXPENSE_RESOURCES.fixedCost,
    fixedCost?.id,
    open,
  );
  const [createdId, setCreatedId] = useState<string>();
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachmentUpload[]>([]);
  const [invalidSavedUploads, setInvalidSavedUploads] = useState(0);
  const [uploadingAttachmentIds, setUploadingAttachmentIds] = useState<Set<string>>(() => new Set());
  const isUploading =
    useIsMutating({
      mutationKey: attachmentKeys.upload,
      predicate: (mutation) => {
        const variables = mutation.state.variables as
          AttachmentUpload | undefined;
        return (
          variables?.refId === (fixedCost?.id ?? createdId)
        );
      },
    }) > 0;
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const [activeTab, setActiveTab] = useState("general");
  const form = useForm<FixedCostForm, unknown, FixedCostValues>({
    resolver: zodResolver(fixedCostFormSchema),
    defaultValues: fixedCostFormDefaults(undefined, { month, year }),
  });
  const { reset, handleSubmit, getValues, setValue } = form;

  useEffect(() => {
    if (!open) return;
    setCreatedId(undefined);
    setPendingAttachments([]);
    setInvalidSavedUploads(0);
    setUploadingAttachmentIds(new Set());
    setActiveTab("general");
    reset(fixedCostFormDefaults(fixedCost, { month, year }));
  }, [open, fixedCost, reset, month, year]);

  // An upload can finish after leaving the Notes tab. Sync only this field, keeping other edits intact.
  useEffect(() => {
    if (
      open &&
      currentCost.data?.paymentStatus === "paid" &&
      getValues("paymentStatus") === "not_started"
    ) {
      setValue("paymentStatus", "paid", { shouldDirty: true });
    }
  }, [
    open,
    fixedCost?.id,
    currentCost.data?.paymentStatus,
    getValues,
    setValue,
  ]);

  const uploadPendingAttachments = async (refId: string, files: PendingAttachmentUpload[]) => {
    const failed: PendingAttachmentUpload[] = [];
    for (const pending of files) {
      setUploadingAttachmentIds((current) => new Set(current).add(pending.id));
      try {
        const attachment = await uploadAttachment.mutateAsync({
          file: pending.file,
          refType: "fixed_cost",
          refId,
          kind: pending.kind,
        });
        if (attachment.kind === "boleta" && getValues("paymentStatus") === "not_started") {
          setValue("paymentStatus", "paid", { shouldDirty: true });
        }
      } catch {
        failed.push(pending);
      } finally {
        setUploadingAttachmentIds((current) => {
          const next = new Set(current);
          next.delete(pending.id);
          return next;
        });
      }
    }
    setPendingAttachments(failed);
    if (failed.length) toast.error("No se pudieron subir todos los archivos. Puedes reintentar desde Notas y archivos.");
  };

  const retryPendingAttachments = () => {
    const id = fixedCost?.id ?? createdId;
    if (id && pendingAttachments.length) void uploadPendingAttachments(id, pendingAttachments);
  };

  const onSubmit = handleSubmit(
    (values) => {
      const hasOversizedPending = pendingAttachments.some(
        ({ file }) => file.size > ATTACHMENT_MAX_MB * 1024 * 1024,
      );
      if (hasOversizedPending || invalidSavedUploads > 0) {
        setActiveTab("notes");
        toast.error(`Comprime o reemplaza los archivos para que pesen ${ATTACHMENT_MAX_MB} MB o menos antes de guardar.`);
        return;
      }
      if (isUploading) return;
      saveExpense.mutate(
        { id: fixedCost?.id ?? createdId, body: fixedCostSaveBody(values) },
        {
          onSuccess: (saved) => {
            if (!fixedCost && !createdId) {
              const id = (saved as FixedCost | undefined)?.id;
              if (id) {
                reset({ ...values, installment: values.installment ?? "", notes: values.notes ?? "" });
                setCreatedId(id);
                setActiveTab("notes");
                if (pendingAttachments.length) void uploadPendingAttachments(id, pendingAttachments);
                return;
              }
            }
            onOpenChange(false);
          },
        },
      );
    },
    (errors) => {
      setActiveTab(
        Object.keys(errors).some((field) =>
          FIXED_COST_SCHEDULE_FIELDS.includes(field),
        )
          ? "schedule"
          : "general",
      );
    },
  );

  return {
    form,
    activeTab,
    setActiveTab,
    onSubmit,
    isEdit: !!fixedCost || !!createdId,
    fixedCostId: fixedCost?.id ?? createdId,
    pendingAttachments,
    setPendingAttachments,
    retryPendingAttachments,
    isUploadingAttachments: isUploading,
    uploadingAttachmentIds,
    hasInvalidAttachments: invalidSavedUploads > 0 || pendingAttachments.some(({ file }) => file.size > ATTACHMENT_MAX_MB * 1024 * 1024),
    invalidSavedUploadCount: invalidSavedUploads,
    isSaving: saveExpense.isPending || isUploading || uploadAttachment.isPending,
    setInvalidSavedUploads,
  };
}
