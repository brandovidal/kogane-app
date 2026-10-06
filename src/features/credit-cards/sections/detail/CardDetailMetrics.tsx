import type { Statement } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate, getMonthName } from "@/shared/lib/dates";

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return <div className="credit-card-surface min-w-0 p-4"><div className="eyebrow">{label}</div><div className="mt-2 truncate text-xl font-semibold tabular-nums" title={value}>{value}</div>{note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}</div>;
}

export function CardDetailMetrics({ view, month, year, amount, categories, largestCategory, statement }: {
  view: "expenses" | "card-detail" | "payment";
  month: number;
  year: number;
  amount: number;
  categories: number;
  largestCategory: string;
  statement?: Statement;
}) {
  const balance = statement?.balances.find((item) => item.currency === "PEN") ?? statement?.balances[0];
  const money = (value: number | null | undefined) => value == null ? "—" : formatCurrency(value, balance?.currency ?? "PEN");
  const period = `${getMonthName(month)} ${year}`;
  if (view === "payment") return null;
  return <section className="space-y-3" aria-label="Resumen del estado de cuenta">
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span className="rounded-full border px-3 py-1">{statement ? "Estado de cuenta cargado" : "Consumo registrado"} · {period}</span><span>{statement?.dueDate ? `Vence ${formatDate(statement.dueDate)}` : "Sin fecha de vencimiento"}</span></div>
    {view === "card-detail" ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Consumo del ciclo" value={formatCurrency(amount)} note={period} /><Metric label="Categorías" value={String(categories)} note="Con movimientos" /><Metric label="Mayor categoría" value={largestCategory} /><Metric label="Intereses y seguros" value={money(balance?.itemizedCharges)} /></div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Consumo registrado" value={formatCurrency(amount)} note={period} /><Metric label="Pago mínimo" value={money(balance?.minimumDue)} /><Metric label="Diferencia con el banco" value={money(balance?.difference)} /><Metric label="Vence" value={statement?.dueDate ? formatDate(statement.dueDate) : "—"} /></div>}
  </section>;
}
