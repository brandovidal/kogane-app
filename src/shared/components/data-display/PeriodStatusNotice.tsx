import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { getMonthName } from "@/shared/lib/dates";
import { periodStatus } from "@/shared/lib/period-status";
import { cn } from "@/shared/utils/cn";

const CURRENT_HINT =
  "Los movimientos se siguen sumando; el total cambia hasta el cierre del mes.";

/** "Octubre 2026 · en curso." / "Septiembre 2026 · facturado." line above a monthly list; nothing for future months. */
export function PeriodStatusNotice({
  month,
  year,
  billedHint,
  currentHint = CURRENT_HINT,
}: {
  month: number;
  year: number;
  /** What to do in a closed month, e.g. "revisa qué falta por cobrar y registra los pagos". */
  billedHint: string;
  currentHint?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  if (!now) return null;
  const status = periodStatus(month, year, now);
  if (status === "future") return null;
  const billed = status === "billed";
  return (
    <p
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground",
        billed
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-primary/25 bg-primary/5",
      )}
    >
      <Info
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0",
          billed ? "text-amber-400" : "text-primary",
        )}
      />
      <span>
        <span className="font-medium text-foreground">
          {getMonthName(month)} {year} · {billed ? "facturado" : "en curso"}.
        </span>{" "}
        {billed ? `Mes cerrado: ${billedHint}.` : currentHint}
      </span>
    </p>
  );
}
