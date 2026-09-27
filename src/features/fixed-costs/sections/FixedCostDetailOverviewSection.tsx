import type { ReactNode } from "react";
import { CalendarDays, CreditCard, Repeat2, Tags, UserRound, Wallet } from "lucide-react";
import type { FixedCost } from "@/shared/api/types";
import { CurrencyDisplay } from "@/features/expenses/components/CurrencyDisplay";
import { EXPENSE_TYPE_LABELS } from "@/shared/constants/finance";
import { formatDate } from "@/shared/lib/dates";
import { FixedCostDetailRow } from "../components/FixedCostDetailRow";

export interface FixedCostDetailOverviewSectionProps {
  fixedCost: FixedCost;
  categoryName: string;
  personName: string;
  accountName: string;
  actions?: ReactNode;
}

export function FixedCostDetailOverviewSection({ fixedCost, categoryName, personName, accountName, actions }: FixedCostDetailOverviewSectionProps) {
  return (
    <div className="space-y-5 px-4 pb-6">
      <section className="rounded-xl border bg-muted/20 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Monto del registro
        </p>
        <div className="text-xl tabular-nums">
          <CurrencyDisplay
            amount={fixedCost.amount}
            currency={fixedCost.currency}
            amountInPEN={fixedCost.amountInPen}
            othersShare={fixedCost.othersShare}
          />
        </div>
      </section>

      {actions}

      <dl className="space-y-1 rounded-xl border p-3" aria-label="Datos del costo fijo">
        <FixedCostDetailRow icon={Tags} label="Categoría" value={categoryName} />
        <FixedCostDetailRow icon={UserRound} label="Persona" value={personName} />
        <FixedCostDetailRow
          icon={Wallet}
          label="Tipo de gasto"
          value={EXPENSE_TYPE_LABELS[fixedCost.expenseType] ?? fixedCost.expenseType}
        />
        <FixedCostDetailRow icon={CreditCard} label="Cuenta" value={accountName} />
        <FixedCostDetailRow
          icon={CalendarDays}
          label="Vencimiento"
          value={fixedCost.dueDate ? formatDate(fixedCost.dueDate) : "Sin vencimiento"}
        />
        <FixedCostDetailRow
          icon={Repeat2}
          label="Cuotas"
          value={fixedCost.installment ?? "No aplica"}
        />
        {fixedCost.exchangeRate != null && (
          <FixedCostDetailRow
            icon={Wallet}
            label="Tipo de cambio"
            value={`${fixedCost.exchangeRate}`}
          />
        )}
      </dl>

      {fixedCost.notes && (
        <section className="rounded-xl border p-4">
          <h3 className="mb-1 text-sm font-medium">Observación</h3>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{fixedCost.notes}</p>
        </section>
      )}
    </div>
  );
}
