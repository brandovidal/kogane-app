import { useId } from "react";
import { Banknote, Pencil, Plus } from "lucide-react";
import type { Summary } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";

export interface IncomeSummarySectionProps {
  budget: Summary["budget"] | undefined;
  totals: { pen: number; usd: number } | undefined;
  onEditSalary: () => void;
}

export function IncomeSummarySection({
  budget,
  totals,
  onEditSalary,
}: IncomeSummarySectionProps) {
  const id = useId();
  const registered = !!budget && !budget.isProposal;
  const salary = registered ? budget.salary : 0;
  const ready = budget !== undefined && totals !== undefined;
  return (
    <section
      className="grid gap-3 md:grid-cols-3"
      aria-label="Resumen de ingresos del mes"
    >
      <div
        className="space-y-3 rounded-lg border p-4"
        aria-labelledby={`${id}-salary`}
      >
        <div className="flex items-center justify-between gap-2">
          <h2
            id={`${id}-salary`}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Banknote className="size-4" aria-hidden="true" /> Sueldo mensual
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={onEditSalary}
            disabled={budget === undefined}
          >
            {registered ? (
              <Pencil aria-hidden="true" />
            ) : (
              <Plus aria-hidden="true" />
            )}
            {registered ? "Editar" : "Registrar"}
          </Button>
        </div>
        <p className="text-2xl font-semibold tabular-nums">
          {budget ? formatCurrency(budget.salary) : "—"}
        </p>
        {budget !== undefined && (
          <div className="space-y-2 text-xs text-muted-foreground">
            <Badge variant="outline">
              {registered ? "Registrado este mes" : "Sin registrar este mes"}
            </Badge>
            {budget?.isProposal ? (
              <p>
                Monto sugerido del último sueldo. Regístralo para confirmarlo en
                este mes.
              </p>
            ) : registered ? (
              <p>
                Límite de gasto: {formatCurrency(budget.limit)} (
                {budget.limitPercent}%)
              </p>
            ) : (
              <p>Agrega el sueldo de este período.</p>
            )}
          </div>
        )}
      </div>
      <div
        className="space-y-3 rounded-lg border p-4"
        aria-labelledby={`${id}-extra`}
      >
        <h2 id={`${id}-extra`} className="text-sm text-muted-foreground">
          Ingresos extra
        </h2>
        <p className="text-2xl font-semibold tabular-nums">
          {totals ? formatCurrency(totals.pen) : "—"}
        </p>
        <p className="text-xs text-muted-foreground">
          Bonos, trabajos extra y ventas del mes.
        </p>
        {!!totals?.usd && (
          <p className="text-sm tabular-nums">
            {formatCurrency(totals.usd, "USD")} adicionales
          </p>
        )}
      </div>
      <div
        className="space-y-3 rounded-lg border bg-muted/20 p-4"
        aria-labelledby={`${id}-total`}
      >
        <h2 id={`${id}-total`} className="text-sm text-muted-foreground">
          Ingresos registrados en soles
        </h2>
        <p className="text-2xl font-semibold tabular-nums">
          {ready ? formatCurrency(salary + totals.pen) : "—"}
        </p>
        <p className="text-xs text-muted-foreground">
          Sueldo confirmado del mes más ingresos extra en PEN.
        </p>
        {!!totals?.usd && (
          <p className="text-xs text-muted-foreground">
            Los dólares se muestran por separado, sin conversión.
          </p>
        )}
      </div>
    </section>
  );
}
