import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RowSelectionState } from "@tanstack/react-table";
import { toast } from "sonner";
import { api, unwrap } from "@/shared/api/client";
import { errorMessage } from "@/shared/api/hooks/use-api-mutation";
import { EXPENSE_RESOURCES, type Subscription } from "@/shared/api/types";
import { duplicateBody } from "@/features/expenses/lib/expense-actions";
import { expenseKeys } from "@/features/expenses/hooks/expenses";

type BulkAction = "duplicate" | "delete" | "status";
type Failure = { id: string; name: string; message: string };

export function usePlatformBulkActions(items: Subscription[], scopeKey: string) {
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [failures, setFailures] = useState<Failure[]>([]);
  const selectedItems = items.filter((item) => selection[item.id]);
  const resource = EXPENSE_RESOURCES.subscription;

  useEffect(() => { setSelection({}); setFailures([]); }, [scopeKey]);
  useEffect(() => {
    const ids = new Set(items.map((item) => item.id));
    setSelection((current) => {
      const next = Object.fromEntries(Object.entries(current).filter(([id, checked]) => checked && ids.has(id)));
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [items]);

  const mutation = useMutation({
    mutationFn: async ({ action, records, status }: { action: BulkAction; records: Subscription[]; status?: string }) => {
      const succeeded: string[] = [];
      const failed: Failure[] = [];
      const perform = (record: Subscription) => {
        if (action === "delete") return unwrap(api.DELETE("/v1/expenses/{resource}/{id}", { params: { path: { resource, id: record.id } } }));
        if (action === "duplicate") return unwrap(api.POST("/v1/expenses/{resource}", { params: { path: { resource } }, body: duplicateBody(resource, record) as never }));
        return unwrap(api.PATCH("/v1/expenses/{resource}/{id}", { params: { path: { resource, id: record.id } }, body: { paymentStatus: status } as never }));
      };
      for (let index = 0; index < records.length; index += 5) {
        const batch = records.slice(index, index + 5);
        const results = await Promise.allSettled(batch.map(perform));
        results.forEach((result, position) => {
          const record = batch[position];
          if (result.status === "fulfilled") succeeded.push(record.id);
          else failed.push({ id: record.id, name: record.description, message: errorMessage(result.reason) });
        });
      }
      return { succeeded, failed, action };
    },
    onSuccess: async ({ succeeded, failed, action }) => {
      setFailures(failed);
      setSelection((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !succeeded.includes(id))));
      await Promise.all([expenseKeys.resource(resource), ["summary"], ["commitments"], ["history"], ["attachments"]].map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      if (succeeded.length) toast.success(`${succeeded.length} ${action === "delete" ? "plataformas eliminadas" : action === "duplicate" ? "plataformas duplicadas" : "estados actualizados"}`);
      if (failed.length) toast.error(`${failed.length} registros no se pudieron procesar. Puedes reintentar su selección.`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return {
    selection, setSelection, selectedItems, failures, pending: mutation.isPending,
    clear: () => { setSelection({}); setFailures([]); },
    run: async (action: BulkAction, status?: string) => {
      if (mutation.isPending || !selectedItems.length || (action === "status" && !status)) return;
      setFailures([]);
      try { await mutation.mutateAsync({ action, records: selectedItems, status }); }
      catch { /* The mutation reports the error; preserve selection for retry. */ }
    },
  };
}
