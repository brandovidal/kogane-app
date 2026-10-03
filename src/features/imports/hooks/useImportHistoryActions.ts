import { useState } from "react";
import { useDiscardImport } from "@/features/imports/hooks/imports";
import { useDeleteStatement } from "@/features/statements/hooks/statements";
import type { HistoryItem } from "@/features/imports/types/import-types";

export function useImportHistoryActions() {
  const discard = useDiscardImport();
  const removeStatement = useDeleteStatement();

  const [deletingItem, setDeletingItem] = useState<HistoryItem | null>(null);
  const deleting = discard.isPending || removeStatement.isPending;
  const confirmRemove = () => {
    if (!deletingItem || deleting) return;
    const mutation =
      deletingItem.source === "notion" ? discard : removeStatement;
    mutation.mutate(deletingItem.id, {
      onSuccess: () => setDeletingItem(null),
    });
  };

  return { deletingItem, setDeletingItem, deleting, confirmRemove };
}
