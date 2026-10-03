import { useState } from "react";
import {
  useDeleteExpense,
  useSaveExpense,
} from "@/features/expenses/hooks/expenses";
import { EXPENSE_RESOURCES, type FixedCost } from "@/shared/api/types";
import type { MoveSource } from "@/features/expenses/components/dialogs/MoveSeriesDialog";
import {
  duplicateBody,
  nextMonthBody,
  previousMonthBody,
} from "@/features/expenses/lib/expense-actions";
import type { FixedCostActions } from "@/features/fixed-costs/types/fixed-cost-types";

export function useFixedCostActions() {
  const saveFixedCost = useSaveExpense(EXPENSE_RESOURCES.fixedCost);
  const deleteFixedCost = useDeleteExpense(EXPENSE_RESOURCES.fixedCost);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedCost>();
  const [openedItem, setOpenedItem] = useState<FixedCost>();
  const [openedTab, setOpenedTab] = useState<"detail" | "files" | "history">("detail");
  const [moving, setMoving] = useState<MoveSource | null>(null);

  const actions: FixedCostActions = {
    onOpen: (cost, tab = "detail") => {
      setOpenedTab(tab);
      setOpenedItem(cost);
    },
    onEdit: (cost) => {
      setEditingItem(cost);
      setOpenedItem(undefined);
      setDialogOpen(true);
    },
    onDuplicate: (cost) =>
      saveFixedCost.mutate({
        body: duplicateBody(EXPENSE_RESOURCES.fixedCost, cost),
      }),
    onNextMonth: (cost) =>
      saveFixedCost.mutate({ id: cost.id, body: nextMonthBody(cost) }),
    onPreviousMonth: (cost) =>
      saveFixedCost.mutate({ id: cost.id, body: previousMonthBody(cost) }),
    onMove: (cost) =>
      setMoving({
        resource: EXPENSE_RESOURCES.fixedCost,
        id: cost.id,
        description: cost.description,
      }),
    onDelete: (cost) => deleteFixedCost.mutateAsync(cost.id),
    onStatusChange: (cost, paymentStatus) =>
      saveFixedCost.mutate({ id: cost.id, body: { paymentStatus } }),
  };

  return {
    actions,
    dialogOpen,
    setDialogOpen,
    editingItem,
    openedItem,
    openedTab,
    moving,
    onCreate: () => {
      setEditingItem(undefined);
      setDialogOpen(true);
    },
    onCloseDetail: () => setOpenedItem(undefined),
    onEditDetail: () => {
      if (openedItem) actions.onEdit(openedItem);
    },
    onCloseMove: () => setMoving(null),
  };
}
