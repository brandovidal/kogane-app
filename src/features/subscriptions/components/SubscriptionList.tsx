import { useState } from "react";
import { nameById, usePeople } from "@/shared/api/hooks/catalogs";
import { useDeleteExpense, useExpenses, useSaveExpense } from "@/shared/api/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES, type Subscription } from "@/shared/api/types";
import { SUBSCRIPTION_PERIOD_LABELS as PERIOD_LABELS } from "@/shared/labels";
import { usePeriod } from "@/shared/stores/period.store";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { EmptyState } from "@/shared/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
import { Plus, Trash2, Pencil } from "lucide-react";
import { SubscriptionDialog } from "./SubscriptionDialog";
import { InlineAddCard } from "@/shared/components/InlineAddCard";

const PERIOD_COLORS: Record<string, string> = {
  biweekly: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  monthly: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  quarterly: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  semiannual: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
  annual: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

function SubscriptionListView() {
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const current = useExpenses(EXPENSE_RESOURCES.subscription, { month: selectedMonth, year: selectedYear }).data ?? [];
  const personName = nameById(usePeople().data);
  const saveSubscription = useSaveExpense(EXPENSE_RESOURCES.subscription);
  const deleteSubscription = useDeleteExpense(EXPENSE_RESOURCES.subscription);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | undefined>();

  const total = current.reduce((sum, s) => sum + (s.amountInPen ?? s.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{current.length} plataformas activas</p>
          <p className="text-2xl font-bold">S/ {total.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/mes</span></p>
        </div>
        <Button size="sm" onClick={() => { setEditingSub(undefined); setDialogOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" /> Nueva plataforma
        </Button>
      </div>

      {current.length === 0 ? (
        <EmptyState description="No hay suscripciones registradas" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {current.map((sub) => (
            <Card key={sub.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{sub.description}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingSub(sub); setDialogOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSubscription.mutate(sub.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CurrencyDisplay amount={sub.amount} currency={sub.currency} amountInPEN={sub.amountInPen} />
                <Separator />
                <div className="flex flex-wrap gap-2">
                  <Badge className={PERIOD_COLORS[sub.period]}>{PERIOD_LABELS[sub.period]}</Badge>
                  <StatusBadge status={sub.paymentStatus} />
                  <Badge variant="outline">{personName(sub.personId)}</Badge>
                </div>
                {sub.notes && (
                  <p className="text-xs text-muted-foreground">{sub.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
          <InlineAddCard
            onSave={(values) => {
              saveSubscription.mutate({
                body: {
                  description: values.description,
                  amount: Number(values.amount),
                  currency: "PEN",
                  period: values.period,
                  personId: values.personId,
                  paymentMonth: selectedMonth,
                  paymentYear: selectedYear,
                },
              });
            }}
          />
        </div>
      )}

      <SubscriptionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subscription={editingSub}
      />
    </div>
  );
}

export const SubscriptionList = withQuery(SubscriptionListView);
