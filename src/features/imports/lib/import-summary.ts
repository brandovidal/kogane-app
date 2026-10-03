import type { ImportDetail } from "@/shared/api/types";
import { monthMatches } from "@/features/imports/lib/import-view";

export function importSummaryOf(batch: ImportDetail) {
  const kpis = [
    {
      label: batch.status === "applied" ? "Creadas" : "Nuevas",
      value: batch.created,
    },
    { label: "Cambiaron en Notion", value: batch.updated },
    { label: "Iguales (no se tocan)", value: batch.unchanged },
    {
      label: "Bloqueadas · avisos",
      value: `${batch.blocked} · ${batch.warnings}`,
    },
  ];
  const months = batch.summary.months.filter(
    (month) => month.notionSpent != null,
  );
  const matching = months.filter(monthMatches).length;

  return { kpis, months, matching };
}
