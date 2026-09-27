import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMutating } from "@tanstack/react-query";
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
  const currentCost = useExpense(
    EXPENSE_RESOURCES.fixedCost,
    fixedCost?.id,
    open,
  );
  const isUploading =
    useIsMutating({
      mutationKey: attachmentKeys.upload,
      predicate: (mutation) => {
        const variables = mutation.state.variables as
          AttachmentUpload | undefined;
        return (
          variables?.refId === fixedCost?.id && variables?.kind === "boleta"
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

  const onSubmit = handleSubmit(
    (values) => {
      if (isUploading) return;
      saveExpense.mutate(
        { id: fixedCost?.id, body: fixedCostSaveBody(values) },
        { onSuccess: () => onOpenChange(false) },
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
    isEdit: !!fixedCost,
    isSaving: saveExpense.isPending || isUploading,
  };
}
