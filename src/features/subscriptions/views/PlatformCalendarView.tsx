import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Subscription } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDayMonth } from "@/shared/lib/dates";
import { daysUntilDue } from "@/features/fixed-costs/lib/fixed-cost-summary";
import { localTodayKey } from "@/features/fixed-costs/lib/fixed-cost-views";
import { periodStore } from "@/shared/stores/period.store";
import { cn } from "@/shared/utils/cn";
import { PlatformMark } from "../components/PlatformMark";
import { nextPlatformChargeDate, platformAmount, platformChargesInMonth } from "../lib/platform-summary";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
type Charge = { item: Subscription; date: string };

function upcomingCharges(items: Subscription[], todayKey: string): Charge[] {
  const end = new Date(`${todayKey}T12:00:00`);
  end.setDate(end.getDate() + 90);
  const endKey = end.toISOString().slice(0, 10);
  const charges: Charge[] = [];
  for (const item of items) {
    let cursor = todayKey;
    for (let index = 0; index < 8; index += 1) {
      const date = nextPlatformChargeDate(item, cursor);
      if (!date || date > endKey) break;
      charges.push({ item, date });
      const next = new Date(`${date}T12:00:00`);
      next.setDate(next.getDate() + 1);
      cursor = next.toISOString().slice(0, 10);
    }
  }
  return charges.sort((left, right) => left.date.localeCompare(right.date));
}

export function PlatformCalendarView({ items, month, year, onOpen }: {
  items: Subscription[];
  month: number;
  year: number;
  onOpen: (item: Subscription) => void;
}) {
  const todayKey = localTodayKey();
  const days = new Date(year, month, 0).getDate();
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const cellCount = Math.ceil((offset + days) / 7) * 7;
  const byDay = new Map<number, Subscription[]>();
  for (const item of items) {
    for (const chargeDate of platformChargesInMonth(item, month, year)) {
      const day = Number(chargeDate.slice(8, 10));
      byDay.set(day, [...(byDay.get(day) ?? []), item]);
    }
  }
  const monthCharges = [...byDay.values()].flat();
  const upcoming = upcomingCharges(items, todayKey);
  const monthName = new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
  return <div className="platform-calendar-layout">
    <section className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2"><h2 className="font-semibold capitalize">{monthName}</h2><span className="text-sm text-muted-foreground">{monthCharges.length} {monthCharges.length === 1 ? "cobro" : "cobros"} · {formatCurrency(monthCharges.reduce((sum, item) => sum + platformAmount(item), 0))}</span></div>
        <div className="flex items-center gap-1"><button type="button" className="rounded px-2 py-1 text-sm hover:bg-accent" onClick={() => { const now = new Date(); periodStore.getState().setPeriod(now.getMonth() + 1, now.getFullYear()); }}>Hoy</button><button type="button" className="rounded p-1.5 hover:bg-accent" aria-label="Mes anterior" onClick={() => periodStore.getState().navigate(-1)}><ChevronLeft className="size-4" /></button><button type="button" className="rounded p-1.5 hover:bg-accent" aria-label="Mes siguiente" onClick={() => periodStore.getState().navigate(1)}><ChevronRight className="size-4" /></button></div>
      </div>
      <div className="platform-calendar-grid">
        {WEEKDAYS.map((day) => <div key={day} className="platform-calendar-weekday">{day}</div>)}
        {Array.from({ length: cellCount }, (_, index) => {
          const day = index - offset + 1;
          const inMonth = day > 0 && day <= days;
          const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const shown = inMonth ? day : day <= 0 ? new Date(year, month - 1, day).getDate() : day - days;
          return <div key={index} className={cn("platform-calendar-day", !inMonth && "text-muted-foreground/40", key === todayKey && "bg-muted/40")}><span className="text-xs font-medium tabular-nums">{shown}</span>{inMonth && (byDay.get(day) ?? []).map((item) => <button key={item.id} type="button" onClick={() => onOpen(item)} className="platform-calendar-charge"><span className="truncate">{item.description}</span><span className="shrink-0 tabular-nums">{formatCurrency(platformAmount(item))}</span></button>)}</div>;
        })}
      </div>
    </section>
    <aside className="platform-upcoming"><h3 className="font-semibold">Próximos cobros</h3><p className="text-xs text-muted-foreground">Siguientes 90 días</p><div className="mt-3">{upcoming.length ? upcoming.slice(0, 5).map(({ item, date }, index) => <button key={`${item.id}-${date}-${index}`} type="button" onClick={() => onOpen(item)} className="flex w-full items-center gap-2 border-t py-3 text-left hover:text-brand"><PlatformMark name={item.description} className="size-8" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.description}</span><span className="block text-xs text-muted-foreground">{formatDayMonth(date)} · {daysUntilDue(date, todayKey) === 0 ? "hoy" : `en ${daysUntilDue(date, todayKey)} días`}</span></span><span className="text-sm font-semibold tabular-nums">{formatCurrency(platformAmount(item))}</span></button>) : <p className="border-t py-4 text-sm text-muted-foreground">Sin cobros programados</p>}</div><div className="flex justify-between border-t pt-3 text-xs"><span className="text-muted-foreground">Total 90 días</span><span className="font-semibold tabular-nums">{formatCurrency(upcoming.reduce((sum, { item }) => sum + platformAmount(item), 0))}</span></div></aside>
  </div>;
}
