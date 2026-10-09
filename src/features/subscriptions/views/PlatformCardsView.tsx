import { Plus } from "lucide-react";
import type { Subscription } from "@/shared/api/types";
import { formatDate } from "@/shared/lib/dates";
import { daysUntilDue } from "@/features/fixed-costs/lib/fixed-cost-summary";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { RowActions } from "@/features/expenses/components/RowActions";
import { Badge } from "@/ui/badge";
import { PlatformMark } from "../components/PlatformMark";
import { PLATFORM_PERIOD_COLORS } from "../constants/platforms";
import { SUBSCRIPTION_PERIOD_LABELS } from "../constants/subscriptions";
import {
  nextPlatformChargeDate,
  formatPlatformCurrency,
  platformNativeAmount,
} from "../lib/platform-summary";

export function PlatformCardsView({
  items,
  personName,
  todayKey,
  onOpen,
  onCreate,
  onEdit,
  onDuplicate,
  onNextMonth,
  onMove,
  onDelete,
  onStatusChange,
}: {
  items: Subscription[];
  personName: (id: string | null | undefined) => string;
  todayKey: string;
  onOpen: (item: Subscription, tab?: "detail" | "files" | "history") => void;
  onCreate: () => void;
  onEdit: (item: Subscription) => void;
  onDuplicate: (item: Subscription) => void;
  onNextMonth: (item: Subscription) => void;
  onMove: (item: Subscription) => void;
  onDelete: (item: Subscription) => Promise<unknown>;
  onStatusChange: (item: Subscription, status: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const date = nextPlatformChargeDate(item, todayKey);
        const days = date && todayKey ? daysUntilDue(date, todayKey) : null;
        return (
          <article key={item.id} className="platform-card text-left">
            <div className="flex items-center gap-3">
              <PlatformMark name={item.description} />
              <button
                type="button"
                onClick={() => onOpen(item)}
                className="min-w-0 flex-1 truncate text-left font-semibold hover:text-brand"
              >
                {item.description}
              </button>
              <RowActions
                label={item.description}
                onEdit={() => onEdit(item)}
                onDuplicate={() => onDuplicate(item)}
                onNextMonth={() => onNextMonth(item)}
                onMove={() => onMove(item)}
                onDelete={() => onDelete(item)}
                files={{ refType: "expense", refId: item.id }}
                history={{ entity: "exp_subscriptions", id: item.id }}
                onOpenFiles={() => onOpen(item, "files")}
                onOpenHistory={() => onOpen(item, "history")}
                status={{
                  value: item.paymentStatus,
                  options: ["not_started", "pending", "paid", "waived"],
                  onChange: (status) => onStatusChange(item, status),
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => onOpen(item)}
              className="block w-full text-left"
            >
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-semibold tabular-nums">
                  {formatPlatformCurrency(
                    platformNativeAmount(item),
                    item.currency,
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  /{" "}
                  {item.period === "annual"
                    ? "año"
                    : item.period === "semiannual"
                      ? "semestre"
                      : item.period === "quarterly"
                        ? "trimestre"
                        : item.period === "biweekly"
                          ? "quincena"
                          : "mes"}
                </span>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Periodo</dt>
                  <dd>
                    <Badge
                      variant="secondary"
                      className={PLATFORM_PERIOD_COLORS[item.period]}
                    >
                      {SUBSCRIPTION_PERIOD_LABELS[item.period]}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Estado</dt>
                  <dd>
                    <StatusBadge status={item.paymentStatus} />
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <dt className="text-muted-foreground">Próximo cobro</dt>
                  <dd className="text-right tabular-nums">
                    {date ? formatDate(date) : "—"}
                    {days != null && (
                      <span className="block text-xs text-amber-500">
                        {days === 0 ? "hoy" : `en ${days} días`}
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Persona</dt>
                  <dd className="truncate">{personName(item.personId)}</dd>
                </div>
              </dl>
            </button>
          </article>
        );
      })}
      <button
        type="button"
        onClick={onCreate}
        className="platform-card platform-card-add"
      >
        <Plus className="size-5" />
        <span>Nueva plataforma</span>
      </button>
    </div>
  );
}
