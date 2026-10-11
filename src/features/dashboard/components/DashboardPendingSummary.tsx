import { formatCurrency } from "@/shared/lib/currency";
import type { SectionSummary } from "../lib/pending-groups";

function SummaryTile({
  label,
  amount,
  detail,
  tone = "default",
}: {
  label: string;
  amount: string;
  detail: string;
  tone?: "default" | "income" | "warning";
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-muted/20 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-0.5 truncate text-lg font-semibold tabular-nums ${tone === "income" ? "text-emerald-400" : tone === "warning" ? "text-amber-300" : ""}`}
      >
        {amount}
      </p>
      <p className="truncate text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

export function DashboardPendingSummary({
  pay,
  collect,
  review,
}: {
  pay: SectionSummary;
  collect: SectionSummary;
  review: SectionSummary;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <SummaryTile
        label="Por pagar"
        amount={formatCurrency(pay.total)}
        detail={`${pay.groups} ${pay.groups === 1 ? "grupo" : "grupos"}${pay.count ? ` · ${pay.count} ${pay.count === 1 ? "elemento" : "elementos"}` : ""}`}
        tone="warning"
      />
      <SummaryTile
        label="Por cobrar"
        amount={formatCurrency(collect.total)}
        detail={`${collect.count} ${collect.count === 1 ? "cuota" : "cuotas"} · ${collect.people} ${collect.people === 1 ? "persona" : "personas"}`}
        tone="income"
      />
      <SummaryTile
        label="Por revisar"
        amount={String(review.count)}
        detail={review.count ? "Pendientes de revisión" : "Sin cerrar"}
      />
    </div>
  );
}
