import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { useDebt } from "@/features/debts/hooks/debts";
import { usePaymentMethods } from "@/shared/api/hooks/catalogs";
import { withQuery } from "@/shared/api/query";
import { getMonthName } from "@/shared/lib/dates";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { Button } from "@/ui/button";
import { DebtDetailOverviewSection } from "../sections/DebtDetailOverviewSection";

function DebtDetailView() {
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
      <DebtDetailOverviewSection debt={debt} methodName={methodName} />
    </div>
  );
}

export const DebtDetailPage = withQuery(DebtDetailView);
