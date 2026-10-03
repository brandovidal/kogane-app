import { useState } from "react";
import type { Category, FixedCost } from "@/shared/api/types";
import { CategoryLabel } from "@/features/categories/components/CategoryLabel";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { AttachmentRecordThumbnail } from "@/features/attachments/components/AttachmentRecordThumbnail";
import { PAYMENT_STATUS_GROUPS, PAYMENT_STATUS_LABELS } from "@/shared/constants/finance";
import { formatCurrency } from "@/shared/lib/currency";
import { cn } from "@/shared/utils/cn";
import { totalsOf } from "@/features/expenses/lib/shared-expense";
import { FixedCostDue } from "../../components/list/FixedCostDue";
import { FIXED_COST_STATUSES } from "../../constants/statuses";
import { parseInstallment } from "../../lib/fixed-cost-views";
import type { CatalogName } from "../../types/fixed-cost-types";

const COLUMNS = [
  { group: PAYMENT_STATUS_GROUPS[0], dot: "bg-slate-400", drop: "not_started" },
  { group: PAYMENT_STATUS_GROUPS[1], dot: "bg-amber-400", drop: "pending" },
  { group: PAYMENT_STATUS_GROUPS[2], dot: "bg-emerald-400", drop: "paid" },
] as const;

/**
 * "Por estado" view: a column per stage. Dropping a card in another column sets the
 * first status of that stage (Por iniciar → No iniciado, En curso → Pendiente,
 * Completados → Pagado); the exact status can still be chosen in the row menu.
 */
export function FixedCostStatusBoard({
  items,
  categories,
  personName,
  loading,
  onOpen,
  onStatusChange,
}: {
  items: FixedCost[];
  categories: Category[];
  personName: CatalogName;
  loading: boolean;
  onOpen: (cost: FixedCost) => void;
  onStatusChange: (cost: FixedCost, status: string) => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<number | null>(null);

  if (loading)
    return (
      <p role="status" className="py-8 text-center text-sm text-muted-foreground">
        Cargando tablero…
      </p>
    );

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {COLUMNS.map((column, index) => {
        const statuses = column.group.statuses as readonly string[];
        const cards = items.filter((cost) => statuses.includes(cost.paymentStatus));
        const allowed = FIXED_COST_STATUSES.filter((status) => statuses.includes(status));
        return (
          <section
            key={column.group.label}
            aria-label={column.group.label}
            onDragOver={(event) => {
              if (!dragging) return;
              event.preventDefault();
              setOver(index);
            }}
            onDragLeave={() => setOver((current) => (current === index ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              const cost = items.find((item) => item.id === dragging);
              setDragging(null);
              setOver(null);
              if (cost && !statuses.includes(cost.paymentStatus)) onStatusChange(cost, column.drop);
            }}
            className={cn(
              "flex min-h-72 flex-col gap-2.5 rounded-2xl border bg-muted/40 p-3 transition-colors",
              over === index && "border-brand/60 bg-brand/5",
            )}
          >
            <header className="flex items-center gap-2 px-1">
              <span className={cn("size-2 rounded-full", column.dot)} />
              <h3 className="text-sm font-semibold">{column.group.label}</h3>
              <span className="text-xs text-muted-foreground">{cards.length}</span>
              <span className="ml-auto text-sm font-medium tabular-nums">{formatCurrency(totalsOf(cards).paid)}</span>
            </header>
            <div className="flex flex-wrap gap-1.5 px-1">
              {allowed.map((status) => (
                <span key={status} className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                  {PAYMENT_STATUS_LABELS[status] ?? status}{" "}
                  {cards.filter((cost) => cost.paymentStatus === status).length}
                </span>
              ))}
            </div>
            {cards.map((cost) => {
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
                    "cursor-grab space-y-2 rounded-xl border bg-card p-3 active:cursor-grabbing",
                    dragging === cost.id && "opacity-50",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <AttachmentRecordThumbnail refType="fixed_cost" refId={cost.id} label={cost.description} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onOpen(cost)}
                          className="truncate text-left font-medium hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {cost.description}
                        </button>
                        <span className="shrink-0 font-semibold tabular-nums">{formatCurrency(cost.amountInPen ?? cost.amount)}</span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        {category && <CategoryLabel name={category.name} icon={category.icon} color={category.color} />}
                        <span>{personName(cost.personId)}</span>
                        {cost.installment && <span className="tabular-nums">Cuota {cost.installment}</span>}
                      </div>
                    </div>
                  </div>
                  {plan && (
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-brand" style={{ width: `${plan.percent}%` }} />
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={cost.paymentStatus} />
                    <FixedCostDue cost={cost} />
                  </div>
                </article>
              );
            })}
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
