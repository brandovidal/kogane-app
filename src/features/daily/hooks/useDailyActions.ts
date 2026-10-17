import { useState } from "react";

import { useDeleteExpense, useSaveExpense } from "@/features/expenses/hooks/expenses";
import { duplicateBody } from "@/features/expenses/lib/expense-actions";
import { useNewExpense } from "@/features/new-expense/stores/new-expense.store";
import { EXPENSE_RESOURCES, type DailyExpense } from "@/shared/api/types";

export function useDailyActions() {
  const deleteExpense = useDeleteExpense(EXPENSE_RESOURCES.daily);
  const saveExpense = useSaveExpense(EXPENSE_RESOURCES.daily);
  const openNewExpense = useNewExpense((state) => state.openWith);
  const [editing, setEditing] = useState<DailyExpense>();
  const [origin, setOrigin] = useState<DailyExpense>();
  const [importing, setImporting] = useState(false);

  return {
    editing,
    setEditing,
    origin,
    setOrigin,
    importing,
    setImporting,
    openNewExpense,
    onDuplicate: (expense: DailyExpense) =>
      saveExpense.mutate({
        body: duplicateBody(EXPENSE_RESOURCES.daily, expense),
      }),
    onDelete: (expense: DailyExpense) => deleteExpense.mutate(expense.id),
  };
}
