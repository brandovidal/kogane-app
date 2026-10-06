import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useDeleteExpense,
  useSaveExpense,
} from "@/features/expenses/hooks/expenses";
import { api, unwrap } from "@/shared/api/client";
import { errorMessage } from "@/shared/api/hooks/use-api-mutation";
import { EXPENSE_RESOURCES, type FixedCost } from "@/shared/api/types";
import type { MoveSource } from "@/features/expenses/components/dialogs/MoveSeriesDialog";
import {
  duplicateBody,
  nextMonthBody,
  previousMonthBody,
} from "@/features/expenses/lib/expense-actions";
import { expenseKeys } from "@/features/expenses/hooks/expense-keys";
import type { FixedCostActions } from "@/features/fixed-costs/types/fixed-cost-types";

export function useFixedCostActions() {
  const saveFixedCost = useSaveExpense(EXPENSE_RESOURCES.fixedCost);
  const deleteFixedCost = useDeleteExpense(EXPENSE_RESOURCES.fixedCost);
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedCost>();
  const [openedItem, setOpenedItem] = useState<FixedCost>();
  const [openedTab, setOpenedTab] = useState<"detail" | "files" | "history">("detail");
  const [moving, setMoving] = useState<MoveSource | null>(null);
  const [copying, setCopying] = useState(false);

  const copyToMonth = async (
    costs: FixedCost[],
    paymentMonth: number,
    paymentYear: number,
  ) => {
    if (!costs.length || copying) return;
    setCopying(true);
    const results = await Promise.allSettled(
      costs.map((cost) => {
        const body = duplicateBody(EXPENSE_RESOURCES.fixedCost, cost);
        body.description = cost.description;
        body.paymentMonth = paymentMonth;
        body.paymentYear = paymentYear;
        if (typeof body.dueDate === "string") {
          const day = Number(body.dueDate.slice(8, 10));
          const lastDay = new Date(Date.UTC(paymentYear, paymentMonth, 0)).getUTCDate();
          body.dueDate = `${paymentYear}-${String(paymentMonth).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
        }
        return unwrap(
          api.POST("/v1/expenses/{resource}", {
            params: { path: { resource: EXPENSE_RESOURCES.fixedCost } },
            body: body as never,
          }),
        );
      }),
    );
    const copied = results.filter((result) => result.status === "fulfilled").length;
    const failed = results.filter((result) => result.status === "rejected");
    if (copied) {
      await Promise.all(
        [
          expenseKeys.resource(EXPENSE_RESOURCES.fixedCost),
          ["summary"],
          ["commitments"],
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
      toast.success(`${copied} ${copied === 1 ? "costo copiado" : "costos copiados"}`);
    }
    if (failed.length) {
      const reason = failed[0]?.reason;
      toast.error(`${failed.length} ${failed.length === 1 ? "costo no se pudo copiar" : "costos no se pudieron copiar"}${reason ? `: ${errorMessage(reason)}` : "."}`);
    }
    setCopying(false);
  };

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
    copying,
    copyToMonth,
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
