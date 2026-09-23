import { useState } from "react";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Card, CardContent } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { AlertCircle, HandCoins, Plus, Trash2 } from "lucide-react";
import { useDebtSummary, useDebts, useDeleteDebt } from "@/shared/api/hooks/debts";
import { withQuery } from "@/shared/api/query";
import type { Debt } from "@/shared/api/types";
import { DEBT_TIMING_LABELS } from "@/shared/labels";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { DebtDialog } from "./DebtDialog";
import { DebtPaymentDialog } from "./DebtPaymentDialog";

type Direction = "owed_to_me" | "i_owe";

// Préstamos y deudas (P17, D60): Me deben · Debo · Por persona, one card per open installment
function DebtsPageView() {
  const [tab, setTab] = useState<Direction | "people">("owed_to_me");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paying, setPaying] = useState<Debt | undefined>();
  const direction: Direction = tab === "i_owe" ? "i_owe" : "owed_to_me";

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <div className="flex items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="owed_to_me">Me deben</TabsTrigger>
            <TabsTrigger value="i_owe">Debo</TabsTrigger>
            <TabsTrigger value="people">Por persona</TabsTrigger>
          </TabsList>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Nueva
          </Button>
        </div>

        <TabsContent value="owed_to_me" className="mt-4">
          <DebtList direction="owed_to_me" onPay={setPaying} />
        </TabsContent>
        <TabsContent value="i_owe" className="mt-4">
          <DebtList direction="i_owe" onPay={setPaying} />
        </TabsContent>
        <TabsContent value="people" className="mt-4">
          <PeopleSummary />
        </TabsContent>
      </Tabs>

      <DebtDialog open={dialogOpen} onOpenChange={setDialogOpen} direction={direction} />
      <DebtPaymentDialog debt={paying} onOpenChange={(open) => !open && setPaying(undefined)} />
    </div>
  );
}

function DebtList({ direction, onPay }: { direction: Direction; onPay: (debt: Debt) => void }) {
  const { data: debts = [], isLoading } = useDebts({ direction });
  const deleteDebt = useDeleteDebt();
  const open = debts.filter((debt) => debt.balance > 0);
  const totalPending = open.reduce((sum, debt) => sum + debt.balance, 0);

  if (isLoading) return null;
  if (!open.length) {
    return <EmptyState description={direction === "owed_to_me" ? "Nadie te debe nada" : "No debes nada"} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">{direction === "owed_to_me" ? "Por cobrar" : "Por pagar"}</p>
        <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {open.map((debt) => {
          const progress = debt.amount > 0 ? (debt.paidAmount / debt.amount) * 100 : 0;
          return (
            <Card key={debt.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">
                      {debt.description}
                      {debt.installment && <Badge variant="outline" className="ml-2 text-xs">{debt.installment}</Badge>}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {debt.person.name} · {getMonthName(debt.paymentMonth)} {debt.paymentYear}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => onPay(debt)} title="Registrar abono">
                      <HandCoins className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteDebt.mutate(debt.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={debt.status} />
                  {debt.timing === "late" && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" /> {DEBT_TIMING_LABELS.late}
                    </Badge>
                  )}
                  {debt.timing === "upcoming" && <Badge variant="outline">{DEBT_TIMING_LABELS.upcoming}</Badge>}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Abonado: {formatCurrency(debt.paidAmount)}</span>
                    <span className="font-medium">{formatCurrency(debt.amount)}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">Saldo: {formatCurrency(debt.balance)}</p>
                </div>

                {debt.notes && <p className="text-xs text-muted-foreground italic">{debt.notes}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PeopleSummary() {
  const { data: rows = [], isLoading } = useDebtSummary();
  if (isLoading) return null;
  if (!rows.length) return <EmptyState description="No hay deudas pendientes" />;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <Card key={row.personId}>
          <CardContent className="pt-6 space-y-2">
            <h3 className="font-medium">{row.name}</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Te debe</span>
              <span>{formatCurrency(row.owedToMe)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Le debes</span>
              <span>{formatCurrency(row.iOwe)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-sm font-semibold">
              <span>Neto</span>
              <span className={row.net >= 0 ? "text-green-600" : "text-red-500"}>{formatCurrency(row.net)}</span>
            </div>
            {row.late > 0 && <p className="text-xs text-red-500">⚠️ {formatCurrency(row.late)} vencido</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const DebtsPage = withQuery(DebtsPageView);
