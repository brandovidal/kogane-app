import { useState } from "react";
import { useImports } from "@/features/imports/hooks/imports";
import { useStatements } from "@/features/statements/hooks/statements";
import { getMonthName } from "@/shared/lib/dates";
import { historyOf } from "@/features/imports/lib/import-view";

export function useImportsPage() {
  const batches = useImports().data ?? [];
  const statements = useStatements().data ?? [];
  const history = historyOf(batches, statements, getMonthName);
  const [selected, setSelected] = useState<string | null>(null);
  // Sin selección se muestra la pantalla de carga (boards I1–I6)
  const current =
    selected && history.some((item) => item.key === selected) ? selected : null;
  const [source, id] = (current ?? ":").split(":");

  return {
    history,
    current,
    source,
    id,
    setSelected,
    startNew: () => setSelected(null),
  };
}
