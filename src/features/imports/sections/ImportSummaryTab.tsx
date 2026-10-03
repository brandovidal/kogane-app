import type { ImportSummaryTabProps } from "../types/import-types";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { monthMatches } from "@/features/imports/lib/import-view";
import { importSummaryOf } from "../lib/import-summary";

export function ImportSummaryTab({ batch }: ImportSummaryTabProps) {
  const { kpis, months, matching } = importSummaryOf(batch);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-xl font-semibold tabular-nums">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-sm">
          <span className="font-medium">
            Por mes frente al Resumen de Notion:
          </span>{" "}
          <span
            className={
              matching === months.length ? "text-emerald-600" : "text-amber-600"
            }
          >
            {matching} de {months.length} cuadran
          </span>
          <span className="block text-xs text-muted-foreground">
            Notion suma las filas enlazadas a cada Resumen (costos fijos y
            tarjetas), no el mes de pago.
          </span>
        </p>
        <div className="max-h-96 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Sueldo</TableHead>
                <TableHead className="text-right">Enlazadas</TableHead>
                <TableHead className="text-right">Notion</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...months].reverse().map((month) => (
                <TableRow key={`${month.year}-${month.month}`}>
                  <TableCell>
                    {getMonthName(month.month)} {month.year}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {month.salary != null ? formatCurrency(month.salary) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(month.linked)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(month.notionSpent ?? 0)}
                  </TableCell>
                  <TableCell>
                    {monthMatches(month) ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-amber-600" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Archivos:{" "}
        {batch.summary.files
          .map((file) => `${file.base} (${file.rows})`)
          .join(" · ")}
      </div>
    </div>
  );
}
