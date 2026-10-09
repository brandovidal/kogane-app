import { Plus } from "lucide-react";
import type { Subscription } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDayMonth } from "@/shared/lib/dates";
import { daysUntilDue } from "@/features/fixed-costs/lib/fixed-cost-summary";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { PlatformMark } from "../components/PlatformMark";
import {
  monthlyEquivalent,
  nextPlatformChargeDate,
  platformAmount,
} from "../lib/platform-summary";

const PERIODS = [
  { key: "monthly", label: "Mensual", dot: "bg-indigo-300" },
  { key: "semiannual", label: "Semestral", dot: "bg-emerald-400" },
  { key: "annual", label: "Anual", dot: "bg-amber-400" },
  { key: "biweekly", label: "Quincenal", dot: "bg-orange-400" },
  { key: "quarterly", label: "Trimestral", dot: "bg-violet-400" },
] as const;

export function PlatformPeriodView({
  items,
  personName,
  todayKey,
  onOpen,
  onCreate,
}: {
  items: Subscription[];
  personName: (id: string | null | undefined) => string;
  todayKey: string;
  onOpen: (item: Subscription) => void;
  onCreate: () => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {PERIODS.filter(
        ({ key }) =>
          items.some((item) => item.period === key) ||
          ["monthly", "semiannual", "annual"].includes(key),
      ).map(({ key, label, dot }) => {
        const group = items.filter((item) => item.period === key);
        const sum = group.reduce(
          (total, item) => total + platformAmount(item),
          0,
        );
        const monthly = group.reduce(
          (total, item) => total + monthlyEquivalent(item),
          0,
        );
        return (
          <section key={key} className="platform-period-column">
            <div className="flex items-center justify-between gap-2 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${dot}`} />
                {label}
                <span className="text-xs font-normal text-muted-foreground">
                  {group.length}
                </span>
              </span>
              <span className="tabular-nums">{formatCurrency(sum)}</span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              ≈ {formatCurrency(monthly)} al mes
            </p>
            <div className="mt-3 space-y-2">
              {group.map((item) => {
                const date = nextPlatformChargeDate(item, todayKey);
                const days =
                  date && todayKey ? daysUntilDue(date, todayKey) : null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpen(item)}
                    className="platform-period-item"
                  >
                    <div className="flex items-center gap-2">
                      <PlatformMark
                        name={item.description}
                        className="size-8"
                      />
                      <span className="min-w-0 flex-1 truncate font-semibold">
                        {item.description}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">
                        {formatCurrency(platformAmount(item))}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Próx. {date ? formatDayMonth(date) : "—"}
                      </span>
                      <span className="text-amber-500">
                        {days == null
                          ? ""
                          : days === 0
                            ? "hoy"
                            : `en ${days} días`}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="truncate text-muted-foreground">
                        {personName(item.personId)}
                      </span>
                      <StatusBadge status={item.paymentStatus} />
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={onCreate}
              className="mt-3 flex items-center gap-2 text-sm hover:text-brand"
            >
              <Plus className="size-4" />
              Nueva plataforma
            </button>
          </section>
        );
      })}
    </div>
  );
}
