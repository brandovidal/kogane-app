import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { useDebt } from "@/shared/api/hooks/debts";
import { usePaymentMethods } from "@/shared/api/hooks/catalogs";
import { withQuery } from "@/shared/api/query";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate, getMonthName } from "@/shared/lib/dates";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { DEBT_STATE_LABELS } from "../debt-filters";

const KIND: Record<string, string> = { payment: "Pago", partial: "Abono", prepaid: "Amortización", cashback: "Cashback" };

function DebtDetailPageView() {
  const [id, setId] = useState<string | null>(null);
  const [back, setBack] = useState("/cobros");
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setId(query.get("id"));
    setBack(query.get("from") === "deudas" ? "/deudas" : "/cobros");
  }, []);
  const { data: debt, isLoading } = useDebt(id);
  const methods = usePaymentMethods().data ?? [];
  const methodName = (methodId: string | null) => methods.find((method) => method.id === methodId)?.name ?? "Sin medio registrado";

  if (!id) return <EmptyState title="Falta el registro" description="Vuelve a la lista y abre el detalle de una cuota." />;
  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando detalle…</p>;
  if (!debt) return <EmptyState title="No se encontró la cuota" description="Puede que haya sido eliminada o ya no tengas acceso." />;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <a href={back}><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button></a>
      <header className="space-y-1"><p className="text-sm text-muted-foreground">{debt.person.name} · {getMonthName(debt.paymentMonth)} {debt.paymentYear}{debt.installment ? ` · Cuota ${debt.installment}` : ""}</p><h1 className="text-2xl font-semibold">{debt.description}</h1></header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Monto original" value={formatCurrency(debt.amount, debt.currency)} />
        <Metric label="Pagado" value={formatCurrency(debt.paidAmount, debt.currency)} />
        <Metric label="Saldo pendiente" value={formatCurrency(debt.balance, debt.currency)} />
        <Metric label="Estado" value={DEBT_STATE_LABELS[debt.status] ?? debt.status} />
      </div>
      <Card><CardContent className="space-y-3 p-4">
        <h2 className="font-semibold">Datos de la cuota</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2"><Info label="Fecha límite" value={debt.dueDate ? formatDate(debt.dueDate) : "Sin fecha"} /><Info label="Tarjeta o cuenta" value={methodName(debt.paymentMethodId)} /><Info label="Último pago" value={debt.paidDate ? formatDate(debt.paidDate) : "Sin pagos"} /><Info label="Notas" value={debt.notes ?? "—"} /></dl>
      </CardContent></Card>
      <Card><CardContent className="space-y-3 p-4">
        <h2 className="font-semibold">Historial de pagos <span className="ml-1 text-sm font-normal text-muted-foreground">{debt.payments.length}</span></h2>
        {!debt.payments.length ? <p className="text-sm text-muted-foreground">Todavía no hay pagos registrados.</p> : <div className="divide-y">{debt.payments.map((payment) => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><div><p className="font-medium">{KIND[payment.kind] ?? payment.kind}</p><p className="text-xs text-muted-foreground">{formatDate(payment.paidAt)} · {methodName(payment.paymentMethodId)}</p>{payment.notes && <p className="text-xs text-muted-foreground">{payment.notes}</p>}</div><strong className="tabular-nums">{formatCurrency(payment.amount, debt.currency)}</strong></div>)}</div>}
      </CardContent></Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold tabular-nums">{value}</p></CardContent></Card>;
}
function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>;
}

export const DebtDetailPage = withQuery(DebtDetailPageView);
