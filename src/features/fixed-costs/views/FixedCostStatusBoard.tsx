import { useState, type ReactNode } from "react";
import type { Category, FixedCost } from "@/shared/api/types";
import { CategoryLabel } from "@/features/categories/components/CategoryLabel";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { AttachmentRecordThumbnail } from "@/features/attachments/components/AttachmentRecordThumbnail";
import {
  PAYMENT_STATUS_GROUPS,
  PAYMENT_STATUS_LABELS,
} from "@/shared/constants/finance";
import { formatCurrency } from "@/shared/lib/currency";
import { cn } from "@/shared/utils/cn";
import { totalsOf } from "@/features/expenses/lib/shared-expense";
import { FixedCostDue } from "../components/list/FixedCostDue";
import { FIXED_COST_STATUSES } from "../constants/statuses";
import { parseInstallment } from "../lib/fixed-cost-views";
import type { CatalogName, FixedCostGroupBy } from "../types/fixed-cost-types";
import { ChevronRight } from "lucide-react";
import { DataLoadingSkeleton } from "@/shared/components/data-display/DataLoadingSkeleton";

const COLUMNS = [
  { group: PAYMENT_STATUS_GROUPS[0], dot: "bg-slate-400", drop: "not_started" },
  { group: PAYMENT_STATUS_GROUPS[1], dot: "bg-amber-400", drop: "pending" },
  { group: PAYMENT_STATUS_GROUPS[2], dot: "bg-emerald-400", drop: "paid" },
] as const;

export function FixedCostStatusBoard({
  items,
  categories,
  personName,
  groupBy,
  loading,
  onOpen,
  onStatusChange,
}: {
  items: FixedCost[];
  categories: Category[];
  personName: CatalogName;
  groupBy: FixedCostGroupBy;
  loading: boolean;
  onOpen: (cost: FixedCost) => void;
  onStatusChange: (cost: FixedCost, status: string) => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const renderCostCard = (cost: FixedCost) => {
    const category = categories.find((entry) => entry.id === cost.categoryId);
    const plan = parseInstallment(cost.installment);
    return (
      <article
        key={cost.id}
        draggable
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          setDragging(cost.id);
        }}
        onDragEnd={() => {
          setDragging(null);
          setOver(null);
        }}
        className={cn(
          "group cursor-grab overflow-hidden rounded-xl border bg-card transition-colors hover:border-brand/35 active:cursor-grabbing",
          dragging === cost.id && "opacity-50",
        )}
      >
        <AttachmentRecordThumbnail
          refType="fixed_cost"
          refId={cost.id}
          label={cost.description}
          showPlaceholder
          variant="cover"
        />
        <div className="space-y-2.5 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => onOpen(cost)}
              className="min-w-0 truncate text-left font-semibold hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {cost.description}
            </button>
            <span className="shrink-0">
              <StatusBadge status={cost.paymentStatus} />
            </span>
          </div>
          <div className="rounded-md bg-muted/45 px-2.5 py-1 text-xl font-semibold tracking-tight tabular-nums">
            {formatCurrency(cost.amountInPen ?? cost.amount)}
          </div>
          {plan && (
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-brand"
                style={{ width: `${plan.percent}%` }}
              />
            </div>
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
            {category && (
              <CategoryLabel
                name={category.name}
                icon={category.icon}
                color={category.color}
              />
            )}
            <span aria-hidden="true">·</span>
            <span>{personName(cost.personId)}</span>
            {cost.installment && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">Cuota {cost.installment}</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 border-t pt-2 text-xs text-muted-foreground">
            <span className="truncate">
              Vence <FixedCostDue cost={cost} />
            </span>
            {plan && (
              <span className="shrink-0 tabular-nums">{plan.percent}%</span>
            )}
          </div>
        </div>
      </article>
    );
  };

  const renderGroupedCards = (
    groupedCards: FixedCost[],
    depth = 0,
  ): ReactNode => {
    if (depth >= groupBy.length) return groupedCards.map(renderCostCard);

    const field = groupBy[depth];
    const groups = new Map<string, FixedCost[]>();
    groupedCards.forEach((cost) => {
      const key =
        field === "person"
          ? (cost.personId ?? "none")
          : (cost.categoryId ?? "none");
      groups.set(key, [...(groups.get(key) ?? []), cost]);
    });
    return [...groups].map(([key, fieldItems]) => {
      const category =
        field === "category"
          ? categories.find((entry) => entry.id === key)
          : undefined;
      const label =
        key === "none"
          ? "Sin asignar"
          : field === "person"
            ? personName(key)
            : (category?.name ?? "Sin categoría");
      return (
        <section key={`${field}:${key}`} className="space-y-2">
          <header className="flex items-center gap-2 px-1 text-xs font-semibold text-muted-foreground">
            <ChevronRight className="size-3.5" />
            <span className="truncate">{label}</span>
            <span className="rounded-full border px-1.5 py-0.5 font-medium">
              {fieldItems.length} {fieldItems.length === 1 ? "gasto" : "gastos"}
            </span>
            <span className="ml-auto tabular-nums">
              {formatCurrency(totalsOf(fieldItems).paid)}
            </span>
          </header>
          <div className="space-y-2">
            {renderGroupedCards(fieldItems, depth + 1)}
          </div>
        </section>
      );
    });
  };

  if (loading) return <DataLoadingSkeleton variant="board" count={3} />;

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {COLUMNS.map((column, index) => {
        const statuses = column.group.statuses as readonly string[];
        const cards = items.filter((cost) =>
          statuses.includes(cost.paymentStatus),
        );
        const allowed = FIXED_COST_STATUSES.filter((status) =>
          statuses.includes(status),
        );
        return (
          <section
            key={column.group.label}
            aria-label={column.group.label}
            onDragOver={(event) => {
              if (!dragging) return;
              event.preventDefault();
              setOver(index);
            }}
            onDragLeave={() =>
              setOver((current) => (current === index ? null : current))
            }
            onDrop={(event) => {
              event.preventDefault();
              const cost = items.find((item) => item.id === dragging);
              setDragging(null);
              setOver(null);
              if (cost && !statuses.includes(cost.paymentStatus))
                onStatusChange(cost, column.drop);
            }}
            className={cn(
              "flex min-h-96 flex-col gap-2.5 rounded-2xl border bg-card/55 p-3 transition-colors",
              over === index && "border-brand/60 bg-brand/5",
            )}
          >
            <header className="flex items-center gap-2 px-1">
              <span className={cn("size-2 rounded-full", column.dot)} />
              <h3 className="text-sm font-semibold">{column.group.label}</h3>
              <span className="text-xs text-muted-foreground">
                {cards.length}
              </span>
              <span className="ml-auto text-sm font-semibold tabular-nums">
                {formatCurrency(totalsOf(cards).paid)}
              </span>
            </header>
            <div className="flex flex-wrap gap-1.5 px-1">
              {allowed.map((status) => (
                <span
                  key={status}
                  className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {PAYMENT_STATUS_LABELS[status] ?? status}{" "}
                  {cards.filter((cost) => cost.paymentStatus === status).length}
                </span>
              ))}
            </div>
            {groupBy.length > 0 && cards.length ? (
              <div className="space-y-2">{renderGroupedCards(cards)}</div>
            ) : (
              cards.map(renderCostCard)
            )}
            {!cards.length && (
              <p className="rounded-xl border border-dashed p-4 text-center text-xs leading-5 text-muted-foreground">
                {index === 0
                  ? "Nada por iniciar."
                  : `Arrastra aquí para marcar «${PAYMENT_STATUS_LABELS[column.drop] ?? column.drop}».`}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
