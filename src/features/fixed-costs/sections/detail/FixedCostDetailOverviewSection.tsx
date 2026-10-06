import type { ReactNode } from "react";
import {
  CalendarDays,
  CreditCard,
  FileText,
  Paperclip,
  Repeat2,
  Tags,
  UserRound,
  Wallet,
} from "lucide-react";
import type { FixedCost } from "@/shared/api/types";
import { CurrencyDisplay } from "@/features/expenses/components/CurrencyDisplay";
import { EXPENSE_TYPE_LABELS } from "@/shared/constants/finance";
import { formatDate } from "@/shared/lib/dates";
import { FixedCostDetailRow } from "../../components/detail/FixedCostDetailRow";
import { AttachmentGallery } from "@/features/attachments/components/AttachmentGallery";
import { LinkifiedText } from "@/shared/components/data-display/LinkifiedText";
import { cn } from "@/shared/utils/cn";
import { parseInstallment } from "../../lib/fixed-cost-views";

export interface FixedCostDetailOverviewSectionProps {
  fixedCost: FixedCost;
  categoryName: string;
  personName: string;
  accountName: string;
  actions?: ReactNode;
  className?: string;
  /** The files have their own tab in the detail sheet; other uses keep them inline. */
  showFiles?: boolean;
}

export function FixedCostDetailOverviewSection({
  fixedCost,
  categoryName,
  personName,
  accountName,
  actions,
  className,
  showFiles = true,
}: FixedCostDetailOverviewSectionProps) {
  const plan = parseInstallment(fixedCost.installment);
  return (
    <div className={cn("min-w-0 space-y-5 p-4", className)}>
      <section className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border bg-muted/20 p-4">
        <div className="min-w-0">
          <p className="eyebrow mb-1">Monto del registro</p>
          <div className="text-3xl font-semibold tracking-tight tabular-nums">
            <CurrencyDisplay
              amount={fixedCost.amount}
              currency={fixedCost.currency}
              amountInPEN={fixedCost.amountInPen}
              othersShare={fixedCost.othersShare}
            />
          </div>
        </div>
        {actions}
      </section>

      <dl
        className="space-y-1 rounded-2xl border p-3"
        aria-label="Datos del costo fijo"
      >
        <FixedCostDetailRow
          icon={Tags}
          label="Categoría"
          value={categoryName}
        />
        <FixedCostDetailRow
          icon={UserRound}
          label="Persona"
          value={personName}
        />
        <FixedCostDetailRow
          icon={Wallet}
          label="Tipo de gasto"
          value={
            EXPENSE_TYPE_LABELS[fixedCost.expenseType] ?? fixedCost.expenseType
          }
        />
        <FixedCostDetailRow
          icon={CreditCard}
          label="Cuenta"
          value={accountName}
        />
        <FixedCostDetailRow
          icon={CalendarDays}
          label="Vencimiento"
          value={
            fixedCost.dueDate
              ? formatDate(fixedCost.dueDate)
              : "Sin vencimiento"
          }
        />
        <FixedCostDetailRow
          icon={FileText}
          label="Observación"
          value={
            <LinkifiedText text={fixedCost.notes?.trim() || "Sin observación"} />
          }
        />
        {!plan && <FixedCostDetailRow icon={Repeat2} label="Cuotas" value="No aplica" />}
        {fixedCost.exchangeRate != null && (
          <FixedCostDetailRow
            icon={Wallet}
            label="Tipo de cambio"
            value={`${fixedCost.exchangeRate}`}
          />
        )}
      </dl>

      {plan && (
        <section className="space-y-2 rounded-2xl border p-4" aria-label="Avance de cuotas">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Cuota {plan.current} de {plan.total}
            </span>
            <span className="tabular-nums text-muted-foreground">{plan.percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-brand" style={{ width: `${plan.percent}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">
            {plan.total - plan.current} {plan.total - plan.current === 1 ? "cuota" : "cuotas"} después de esta
          </p>
        </section>
      )}

      {showFiles && <section
        className="min-w-0 space-y-3 rounded-2xl border p-4"
        aria-label="Archivos del registro"
      >
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Paperclip aria-hidden="true" className="size-4" />
          Archivos
        </h3>
        <AttachmentGallery
          key={fixedCost.id}
          refType="fixed_cost"
          refId={fixedCost.id}
        />
      </section>}
    </div>
  );
}
