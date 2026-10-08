import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { getCurrentMonth, getCurrentYear, getMonthName } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";

export function DashboardPeriodNotice() {
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);

  const isCurrent = month === getCurrentMonth() && year === getCurrentYear();
  const daysInMonth = new Date(year, month, 0).getDate();
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  const periodIndex = year * 12 + month;
  const currentIndex = getCurrentYear() * 12 + getCurrentMonth();
  const isBilled = periodIndex < currentIndex;
  const detail = isCurrent && today
    ? `Día ${today.getDate()} de ${daysInMonth}: los movimientos se siguen sumando. Compara con ${getMonthName(previousMonth).toLowerCase()} de ${previousYear}, el último período cerrado.`
    : isBilled
      ? "Mes cerrado: revisa lo que quedó pendiente y registra los pagos atrasados."
      : "Consulta los movimientos del período seleccionado.";
  const className = isBilled
    ? "flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground"
    : "flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-muted-foreground";

  return (
    <div className={className}>
      <Info className={`size-4 shrink-0 ${isBilled ? "text-amber-400" : "text-primary"}`} />
      <p><span className="font-medium text-foreground">{getMonthName(month)} {year} · {isCurrent ? "en curso" : isBilled ? "facturado" : "período seleccionado"}.</span> {detail}</p>
    </div>
  );
}
