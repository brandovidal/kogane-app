import {
  useApplyImport,
  useDiscardImport,
  useImport,
} from "@/features/imports/hooks/imports";

export function useNotionImportDetail(id: string) {
  const batch = useImport(id).data;
  const apply = useApplyImport();
  const discard = useDiscardImport();

  const preview = batch?.status === "preview";

  const confirmApply = () => {
    if (!batch) return;
    const total = batch.created + batch.updated;
    if (
      window.confirm(
        `¿Importar ${total} filas (${batch.created} nuevas y ${batch.updated} que cambiaron)? Las ${batch.unchanged} iguales no se tocan.`,
      )
    ) {
      apply.mutate(batch.id);
    }
  };

  const confirmDiscard = () => {
    if (batch && window.confirm("¿Descartar sin importar?"))
      discard.mutate(batch.id);
  };
  return { batch, apply, discard, preview, confirmApply, confirmDiscard };
}
