import { Badge } from "@/ui/badge";
import { RowActions } from "@/features/expenses/components/RowActions";
import { CurrencyDisplay } from "@/features/expenses/components/CurrencyDisplay";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import type { Subscription } from "@/shared/api/types";
import type { Column } from "@/shared/types/data-view";
import { PLATFORM_PERIOD_COLORS } from "../constants/platforms";
import { SUBSCRIPTION_PERIOD_LABELS } from "../constants/subscriptions";
import { SUBSCRIPTION_STATUSES } from "../constants/subscriptions";
import { PlatformMark } from "../components/PlatformMark";
import { platformAmount } from "./platform-summary";
import { daysUntilDue } from "@/features/fixed-costs/lib/fixed-cost-summary";
import { nextPlatformChargeDate } from "./platform-summary";

interface PlatformColumnActions {
  onOpen: (item: Subscription, tab?: "detail" | "files" | "history") => void;
  onEdit: (item: Subscription) => void;
  onDuplicate: (item: Subscription) => void;
  onNextMonth: (item: Subscription) => void;
  onMove: (item: Subscription) => void;
  onDelete: (item: Subscription) => Promise<unknown>;
  onStatusChange: (item: Subscription, status: string) => void;
}

export function getPlatformColumns({
  personName,
  todayKey,
  actions,
}: {
  personName: (id: string | null | undefined) => string;
  todayKey: string;
  actions: PlatformColumnActions;
}): Column<Subscription>[] {
  return [
    {
      key: "description",
      header: "Plataforma",
      role: "title",
      className: "min-w-[190px] w-[24%]",
      accessor: (item) => item.description,
      cell: (item) => (
        <button
          type="button"
          onClick={() => actions.onOpen(item)}
          className="inline-flex min-w-0 items-center gap-3 rounded-sm text-left hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PlatformMark name={item.description} />
          <span className="truncate font-semibold">{item.description}</span>
        </button>
      ),
    },
    {
      key: "period",
      header: "Periodo",
      className: "min-w-[105px] w-[12%]",
      accessor: (item) =>
        SUBSCRIPTION_PERIOD_LABELS[item.period] ?? item.period,
      cell: (item) => (
        <Badge
          variant="secondary"
          className={PLATFORM_PERIOD_COLORS[item.period]}
        >
          {SUBSCRIPTION_PERIOD_LABELS[item.period] ?? item.period}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      className: "min-w-[110px] w-[12%] text-right",
      calculationType: "number",
      formatCalculation: (value) => formatCurrency(value),
      accessor: platformAmount,
      cell: (item) => (
        <span className="font-semibold">
          <CurrencyDisplay
            amount={item.amount}
            currency={item.currency}
            amountInPEN={item.amountInPen}
            othersShare={item.othersShare}
          />
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      className: "min-w-[125px] w-[13%]",
      accessor: (item) => item.paymentStatus,
      cell: (item) => <StatusBadge status={item.paymentStatus} />,
    },
    {
      key: "person",
      header: "Persona",
      className: "min-w-[120px] w-[12%]",
      accessor: (item) => personName(item.personId),
      cell: (item) => {
        const name = personName(item.personId);
        const initials = name
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase();
        return (
          <span className="inline-flex items-center gap-2 text-sm">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
              {initials}
            </span>
            {name}
          </span>
        );
      },
    },
    {
      key: "dueDate",
      header: "Próximo cobro",
      className: "min-w-[130px] w-[14%]",
      accessor: (item) => nextPlatformChargeDate(item, todayKey),
      cell: (item) => {
        const date = nextPlatformChargeDate(item, todayKey);
        if (!date)
          return <span className="text-sm text-muted-foreground">—</span>;
        const days = todayKey ? daysUntilDue(date, todayKey) : null;
        return (
          <span className="flex flex-col text-sm tabular-nums">
            <span>{formatDate(date)}</span>
            {days != null && (
              <span className="text-xs text-amber-500">
                {days === 0 ? "hoy" : `en ${days} días`}
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: "notes",
      header: "Nota",
      className: "min-w-[140px] w-[12%]",
      accessor: (item) => item.notes,
      cell: (item) => (
        <span
          className="block max-w-48 truncate text-sm text-muted-foreground"
          title={item.notes ?? undefined}
        >
          {item.notes || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-12 min-w-12",
      cell: (item) => (
        <RowActions
          label={item.description}
          files={{ refType: "expense", refId: item.id }}
          history={{ entity: "exp_subscriptions", id: item.id }}
          onEdit={() => actions.onEdit(item)}
          onOpenFiles={() => actions.onOpen(item, "files")}
          onOpenHistory={() => actions.onOpen(item, "history")}
          onDuplicate={() => actions.onDuplicate(item)}
          onNextMonth={() => actions.onNextMonth(item)}
          onMove={() => actions.onMove(item)}
          onDelete={() => actions.onDelete(item)}
          status={{
            value: item.paymentStatus,
            options: SUBSCRIPTION_STATUSES,
            onChange: (status) => actions.onStatusChange(item, status),
          }}
        />
      ),
    },
  ];
}
