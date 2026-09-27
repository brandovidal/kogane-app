import type { Debt } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { Card, CardContent } from "@/ui/card";
import { DEBT_STATE_LABELS } from "../debt-filters";

const PAYMENT_KIND_LABELS: Record<string, string> = {
  payment: "Pago",
  partial: "Abono",
  prepaid: "Amortización",
  cashback: "Cashback",
};

export function DebtDetailOverviewSection({
  debt,
  methodName,
}: {
  debt: Debt;
  methodName: (methodId: string | null) => string;
}) {
  const metrics = [
    { label: "Monto original", value: formatCurrency(debt.amount, debt.currency) },
    { label: "Pagado", value: formatCurrency(debt.paidAmount, debt.currency) },
    { label: "Saldo pendiente", value: formatCurrency(debt.balance, debt.currency) },
    { label: "Estado", value: DEBT_STATE_LABELS[debt.status] ?? debt.status },
  ];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold">Datos de la cuota</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Fecha límite" value={debt.dueDate ? formatDate(debt.dueDate) : "Sin fecha"} />
            <Info label="Tarjeta o cuenta" value={methodName(debt.paymentMethodId)} />
            <Info label="Último pago" value={debt.paidDate ? formatDate(debt.paidDate) : "Sin pagos"} />
            <Info label="Notas" value={debt.notes ?? "—"} />
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="font-semibold">
            Historial de pagos <span className="ml-1 text-sm font-normal text-muted-foreground">{debt.payments.length}</span>
          </h2>
          {!debt.payments.length ? (
            <p className="text-sm text-muted-foreground">Todavía no hay pagos registrados.</p>
          ) : (
            <div className="divide-y">
              {debt.payments.map((payment) => (
                <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <p className="font-medium">{PAYMENT_KIND_LABELS[payment.kind] ?? payment.kind}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(payment.paidAt)} · {methodName(payment.paymentMethodId)}</p>
                    {payment.notes && <p className="text-xs text-muted-foreground">{payment.notes}</p>}
                  </div>
                  <strong className="tabular-nums">{formatCurrency(payment.amount, debt.currency)}</strong>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
