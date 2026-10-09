import type { Subscription } from "@/shared/api/types";
import { formatDayMonth } from "@/shared/lib/dates";
import {
  formatPlatformTotals,
  formatPlatformCurrency,
  monthlyEquivalent,
  platformNativeAmount,
  summarizePlatforms,
} from "../../lib/platform-summary";
import { SUBSCRIPTION_PERIOD_LABELS } from "../../constants/subscriptions";
import { IndicatorsDisclosure } from "@/shared/components/data-display/IndicatorsDisclosure";
import { IndicatorsCollapsedSummary } from "@/shared/components/data-display/IndicatorsCollapsedSummary";

export function PlatformOverview({
  items,
  todayKey,
  loading,
}: {
  items: Subscription[];
  todayKey: string;
  loading: boolean;
}) {
  const summary = summarizePlatforms(items, todayKey);
  const metric = (
    label: string,
    value: string,
    detail: string,
    active = false,
  ) => (
    <div
      className={`min-w-0 rounded-xl border border-border/80 bg-card px-4 py-3.5 ${active ? "bg-brand/5 ring-2 ring-brand/30" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow truncate">{label}</span>
        {active && (
          <span className="text-xs font-medium text-brand">Mostrando</span>
        )}
      </div>
      <div className="mt-1 truncate text-2xl font-semibold tracking-tight tabular-nums">
        {loading ? "—" : value}
      </div>
      <div className="mt-1 truncate text-xs text-muted-foreground">
        {detail}
      </div>
    </div>
  );
  const expensive = summary.mostExpensive;
  const next = summary.nextDue;
  const expensiveCurrency = expensive?.currency === "USD" ? "USD" : "PEN";
  const expensivePercentage = expensive
    ? Math.round(
        (monthlyEquivalent(expensive) /
          (summary.monthly[expensiveCurrency] ?? 1)) *
          100,
      )
    : 0;
  const expensiveDetail = expensive
    ? `${formatPlatformCurrency(platformNativeAmount(expensive), expensive.currency)} · ${(SUBSCRIPTION_PERIOD_LABELS[expensive.period] ?? expensive.period).toLowerCase()} · ${expensivePercentage}% del gasto en ${expensiveCurrency === "USD" ? "US$" : "S/"}`
    : "Sin plataformas";
  const nextDueLabel =
    next && summary.nextDueDate
      ? `${next.description} · ${formatDayMonth(summary.nextDueDate)}`
      : "—";
  const collapsedSummary = loading
    ? "Cargando indicadores"
    : `${formatPlatformTotals(summary.monthly)} · ${summary.count} ${summary.count === 1 ? "plataforma" : "plataformas"}`;
  return (
    <IndicatorsDisclosure
      ariaLabel="indicadores de plataformas"
      defaultOpen={false}
      collapsedLabel="Expandir"
      summary={collapsedSummary}
      collapsedContent={
        <IndicatorsCollapsedSummary
          summary={collapsedSummary}
          metrics={[
            {
              label: "Equivalente mensual",
              value: loading ? "—" : formatPlatformTotals(summary.monthly),
            },
            {
              label: "Costo anual",
              value: loading ? "—" : formatPlatformTotals(summary.annual),
            },
            {
              label: "Más cara",
              value: loading ? "—" : (expensive?.description ?? "—"),
            },
            {
              label: "Próximo cobro",
              value: loading ? "—" : nextDueLabel,
            },
          ]}
        />
      }
    >
      <section
        className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumen de plataformas"
      >
        {metric(
          "Equivalente mensual",
          formatPlatformTotals(summary.monthly),
          `${summary.count} ${summary.count === 1 ? "plataforma activa" : "plataformas activas"}`,
          true,
        )}
        {metric(
          "Costo anual",
          formatPlatformTotals(summary.annual),
          "12 meses al ritmo actual",
        )}
        <div className="min-w-0 rounded-xl border border-border/80 bg-card px-4 py-3.5">
          <div className="eyebrow">Más cara</div>
          <div className="mt-1 truncate text-xl font-semibold tracking-tight">
            {loading ? "—" : (expensive?.description ?? "—")}
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground">
            {expensiveDetail}
          </div>
        </div>
        <div className="min-w-0 rounded-xl border border-border/80 bg-card px-4 py-3.5">
          <div className="eyebrow">Próximo cobro</div>
          <div className="mt-1 truncate text-xl font-semibold tracking-tight">
            {loading ? "—" : nextDueLabel}
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground">
            {next
              ? `${formatPlatformCurrency(platformNativeAmount(next), next.currency)} · ${summary.nextDueDays == null ? "sin fecha relativa" : summary.nextDueDays === 0 ? "hoy" : `en ${summary.nextDueDays} días`}`
              : "Sin cobros programados"}
          </div>
        </div>
      </section>
    </IndicatorsDisclosure>
  );
}
