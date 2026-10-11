import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { errorMessage } from "@/shared/api/hooks/use-api-mutation";
import { importList, type ListImportTarget } from "../services/import.service";

// Preview first (nothing is created), then apply: the API reads the same CSV both times
export function useListImport(target: ListImportTarget) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { file: File; apply: boolean }) =>
      importList({ target, ...input }),
    onSuccess: async (result) => {
      if (!result.applied) return;
      await Promise.all(
        [["expenses"], ["debts"], ["calendar"], ["summary"]].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
      toast.success(
        `${result.created} ${result.created === 1 ? "fila importada" : "filas importadas"}`,
      );
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
