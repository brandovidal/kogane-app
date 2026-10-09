import { importKeys } from "../constants/import-keys";
export { importKeys } from "../constants/import-keys";
import type { ImportRowsParams } from "../types/import-types";
export type { ImportRowsParams } from "../types/import-types";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { useApiMutation } from "@/shared/api/hooks/use-api-mutation";
import {
  applyImport,
  discardImport,
  getImport,
  getImportRows,
  getImports,
  uploadNotionImport,
} from "../services/import.service";

export const useImports = () =>
  useQuery({
    queryKey: importKeys.list,
    queryFn: getImports,
  });

export const useImport = (id: string | null) =>
  useQuery({
    queryKey: importKeys.detail(id ?? ""),
    queryFn: () => getImport(id!),
    enabled: !!id,
  });

// One page of a tab; the previous page stays on screen while the next one loads
export const useImportRows = (id: string, params: ImportRowsParams) =>
  useQuery({
    queryKey: importKeys.rows(id, params),
    queryFn: () => getImportRows(id, params),
    placeholderData: keepPreviousData,
  });

// Multipart through the /api proxy: the ZIP of Notion or its CSV files. It only saves a preview
export function useUploadNotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadNotionImport,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: importKeys.all });
      toast.success("Listo para revisar: todavía no se guardó nada");
    },
  });
}

// Applying writes expenses, debts, the budget and the calendar
export const useApplyImport = () =>
  useApiMutation((id: string) => applyImport(id), {
    invalidate: [
      importKeys.all,
      ["expenses"],
      ["debts"],
      ["budget"],
      ["summary"],
      ["calendar"],
    ],
    success: "Importado",
  });

export const useDiscardImport = () =>
  useApiMutation((id: string) => discardImport(id), {
    invalidate: [importKeys.all],
    success: "Previsualización descartada",
  });
