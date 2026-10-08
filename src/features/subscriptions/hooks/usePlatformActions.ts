import { useState } from "react";
import { useDeleteExpense, useSaveExpense } from "@/features/expenses/hooks/expenses";
import { duplicateBody, nextMonthBody } from "@/features/expenses/lib/expense-actions";
import type { MoveSource } from "@/features/expenses/components/dialogs/MoveSeriesDialog";
import { EXPENSE_RESOURCES, type Subscription } from "@/shared/api/types";

export function usePlatformActions() {
  const save = useSaveExpense(EXPENSE_RESOURCES.subscription);
  const remove = useDeleteExpense(EXPENSE_RESOURCES.subscription);
  const [editing, setEditing] = useState<Subscription>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [moving, setMoving] = useState<MoveSource | null>(null);
  const [openedItem, setOpenedItem] = useState<Subscription>();
  const [openedTab, setOpenedTab] = useState<"detail" | "files" | "history">("detail");

  return {
    editing,
    dialogOpen,
    setDialogOpen,
    moving,
    setMoving,
    openedItem,
    openedTab,
    onOpen: (item: Subscription, tab: "detail" | "files" | "history" = "detail") => {
      setOpenedItem(item);
      setOpenedTab(tab);
    },
    onCloseDetail: () => setOpenedItem(undefined),
    onCreate: () => {
      setEditing(undefined);
      setOpenedItem(undefined);
      setDialogOpen(true);
    },
    onEdit: (item: Subscription) => {
      setEditing(item);
      setOpenedItem(undefined);
      setDialogOpen(true);
    },
    onDuplicate: (item: Subscription) =>
      save.mutate({ body: duplicateBody(EXPENSE_RESOURCES.subscription, item) }),
    onNextMonth: (item: Subscription) =>
      save.mutate({ id: item.id, body: nextMonthBody(item) }),
    onPaymentPeriodChange: (item: Subscription, period: { month: number; year: number }) =>
      save.mutate(
        { id: item.id, body: { paymentMonth: period.month, paymentYear: period.year } },
        { onSuccess: () => setOpenedItem((current) => current?.id === item.id ? { ...current, ...period } : current) },
      ),
    onMove: (item: Subscription) => setMoving({
      resource: EXPENSE_RESOURCES.subscription,
      id: item.id,
      description: item.description,
      kind: item.kind,
    }),
    onDelete: (item: Subscription) => remove.mutateAsync(item.id),
    onStatusChange: (item: Subscription, paymentStatus: string) =>
      save.mutate({ id: item.id, body: { paymentStatus } }),
  };
}
