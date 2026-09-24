import { AlertTriangle, OctagonAlert } from "lucide-react";

import type { Summary } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

import { STATUS_BAR, STATUS_TEXT, type LimitStatus } from "../budget-view";

// Presupuesto vs real (D78): one bar per category with a limit; the state has an icon and a label, not only color
export function BudgetVsActual({ summary, compact = false }: { summary: Summary | undefined; compact?: boolean }) {
  const lines = summary?.byCategory ?? [];
  const limited = lines.filter((line) => line.limit != null);
  const unlimited = lines.filter((line) => line.limit == null && line.spent > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Presupuesto vs real</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!limited.length && (
          <p className="text-sm text-muted-foreground">
            Sin límites por categoría. Ponlos en <a href="/categorias" className="text-primary underline">Categorías</a>.
          </p>
        )}
        {(compact ? limited.slice(0, 5) : limited).map((line) => {
          const status = (line.status ?? "ok") as LimitStatus;
          const percent = line.percent ?? 0;
          return (
            <div key={line.categoryId ?? "none"} className="space-y-1" title={`${line.name}: ${formatCurrency(line.spent)} de ${formatCurrency(line.limit ?? 0)}`}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: line.color }} aria-hidden />
                  {line.name}
                </span>
                <span className={`flex items-center gap-1 tabular-nums ${STATUS_TEXT[status]}`}>
                  {status === "over" && <OctagonAlert className="h-3.5 w-3.5" aria-label="Excedido" />}
                  {status === "warning" && <AlertTriangle className="h-3.5 w-3.5" aria-label="Cerca del límite" />}
                  {formatCurrency(line.spent)} / {formatCurrency(line.limit ?? 0)} · {Math.round(percent)} %
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-2 rounded-full ${STATUS_BAR[status]}`} style={{ width: `${Math.min(percent, 100)}%` }} />
              </div>
            </div>
          );
        })}
        {!compact && unlimited.length > 0 && (
          <div className="border-t pt-3">
            <p className="mb-1 text-xs text-muted-foreground">Sin límite</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {unlimited.map((line) => (
                <span key={line.categoryId ?? "none"}>
                  {line.name} <span className="tabular-nums text-muted-foreground">{formatCurrency(line.spent)}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
