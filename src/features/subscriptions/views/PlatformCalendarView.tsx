import type { Subscription } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { cn } from "@/shared/utils/cn";
import { PlatformMark } from "../components/PlatformMark";
import { platformChargesInMonth } from "../lib/platform-summary";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function PlatformCalendarView({ items, month, year, onOpen }: {
  items: Subscription[];
  month: number;
  year: number;
  onOpen: (item: Subscription) => void;
}) {
  const days = new Date(year, month, 0).getDate();
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const byDay = new Map<number, Subscription[]>();
  for (const item of items) {
    for (const chargeDate of platformChargesInMonth(item, month, year)) {
      const dueDay = Number(chargeDate.slice(8, 10));
      byDay.set(dueDay, [...(byDay.get(dueDay) ?? []), item]);
    }
  }
  const unscheduled = items.filter((item) => !platformChargesInMonth(item, month, year).length);

  return <div className="space-y-4">
    <div className="grid grid-cols-7 overflow-hidden rounded-xl border bg-card">
      {WEEKDAYS.map((day) => <div key={day} className="border-b bg-muted/30 px-2 py-2 text-center text-xs font-semibold text-muted-foreground">{day}</div>)}
      {Array.from({ length: offset }, (_, index) => <div key={`empty-${index}`} className="min-h-24 border-b border-r bg-muted/10" />)}
      {Array.from({ length: days }, (_, index) => {
        const day = index + 1;
        return <div key={day} className={cn("min-h-24 space-y-1 border-b border-r p-1.5", byDay.has(day) && "bg-brand/[0.03]")}><span className="text-xs font-medium tabular-nums text-muted-foreground">{day}</span>{(byDay.get(day) ?? []).map((item) => <button key={item.id} type="button" onClick={() => onOpen(item)} className="flex w-full min-w-0 items-center gap-1 rounded-md bg-accent px-1.5 py-1 text-left text-[11px] hover:ring-1 hover:ring-brand/40"><span className="truncate font-medium">{item.description}</span><span className="ml-auto shrink-0 tabular-nums">{formatCurrency(item.amountInPen ?? item.amount)}</span></button>)}</div>;
      })}
    </div>
    {unscheduled.length > 0 && <section className="rounded-xl border bg-card p-4"><h3 className="mb-3 text-sm font-semibold">Sin cobro en este calendario</h3><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{unscheduled.map((item) => <button key={item.id} type="button" onClick={() => onOpen(item)} className="flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left transition-colors hover:bg-muted/30"><PlatformMark name={item.description} className="size-7" /><span className="min-w-0 flex-1 truncate text-sm">{item.description}</span><span className="text-xs text-muted-foreground">{item.dueDate ? "Otro mes" : "Sin fecha"}</span></button>)}</div></section>}
  </div>;
}
