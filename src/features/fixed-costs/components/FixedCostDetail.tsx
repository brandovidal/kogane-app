import {
  CalendarDays,
  CreditCard,
  Pencil,
  Repeat2,
  Tags,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { EXPENSE_TYPE_LABELS } from "@/shared/labels";
import { formatDate, getMonthName } from "@/shared/lib/dates";
import type { FixedCost } from "@/shared/api/types";
import { Button } from "@/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";

interface FixedCostDetailProps {
  fixedCost?: FixedCost;
  categoryName: string;
  personName: string;
  accountName: string;
  onClose: () => void;
  onEdit: () => void;
}

export function FixedCostDetail({
  fixedCost,
  categoryName,
  personName,
  accountName,
  onClose,
  onEdit,
}: FixedCostDetailProps) {
  return (
    <Sheet open={!!fixedCost} onOpenChange={(open) => !open && onClose()}>
      {fixedCost && (
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="border-b pb-4 pr-12">
            <SheetTitle className="flex flex-wrap items-center gap-2 text-left">
              {fixedCost.description}
              <StatusBadge status={fixedCost.paymentStatus} />
            </SheetTitle>
            <SheetDescription>
              {categoryName} · {getMonthName(fixedCost.paymentMonth)} {fixedCost.paymentYear}
            </SheetDescription>
          </SheetHeader>

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

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={onEdit}>
                <Pencil className="mr-1.5 size-4" /> Editar costo fijo
              </Button>
            </div>

            <section className="space-y-1 rounded-xl border p-3" aria-label="Datos del costo fijo">
              <DetailRow icon={Tags} label="Categoría" value={categoryName} />
              <DetailRow icon={UserRound} label="Persona" value={personName} />
              <DetailRow
                icon={Wallet}
                label="Tipo de gasto"
                value={EXPENSE_TYPE_LABELS[fixedCost.expenseType] ?? fixedCost.expenseType}
              />
              <DetailRow icon={CreditCard} label="Cuenta" value={accountName} />
              <DetailRow
                icon={CalendarDays}
                label="Vencimiento"
                value={fixedCost.dueDate ? formatDate(fixedCost.dueDate) : "Sin vencimiento"}
              />
              <DetailRow
                icon={Repeat2}
                label="Cuotas"
                value={fixedCost.installment ?? "No aplica"}
              />
              {fixedCost.exchangeRate != null && (
                <DetailRow
                  icon={Wallet}
                  label="Tipo de cambio"
                  value={`${fixedCost.exchangeRate}`}
                />
              )}
            </section>

            {fixedCost.notes && (
              <section className="rounded-xl border p-4">
                <h3 className="mb-1 text-sm font-medium">Observación</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{fixedCost.notes}</p>
              </section>
            )}
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 border-b py-2 last:border-0">
      <dt className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}
