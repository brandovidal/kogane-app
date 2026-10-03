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
  const current =
    selected && history.some((item) => item.key === selected)
      ? selected
      : (history[0]?.key ?? null);
  const [source, id] = (current ?? ":").split(":");

  return { history, current, source, id, setSelected };
}
