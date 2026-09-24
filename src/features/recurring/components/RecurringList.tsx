import { useState } from "react";
import { nameById, useCategories, usePaymentMethods, usePeople } from "@/shared/api/hooks/catalogs";
import { useDeleteExpense, useExpenses, useSaveExpense } from "@/shared/api/hooks/expenses";
import { useGenerateRecurring } from "@/shared/api/hooks/calendar";
import { usePeriod } from "@/shared/stores/period.store";
import { toast } from "sonner";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { RECURRING_TARGET_LABELS as TARGET_LABELS } from "@/shared/labels";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Card, CardContent } from "@/ui/card";
import { Switch } from "@/ui/switch";
import { Plus, Trash2, Calendar, CalendarPlus } from "lucide-react";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { RecurringDialog } from "./RecurringDialog";

// Recurring templates (D88): kogane-api creates their pending rows on day 1 at 06:00; "Generar" does it now for the
// month on screen, never twice
function RecurringListView() {
  const { data: recurring = [], isLoading } = useExpenses(EXPENSE_RESOURCES.recurring);
  const categories = useCategories().data ?? [];
  const accountName = nameById(usePaymentMethods().data);
  const personName = nameById(usePeople().data);
  const saveRecurring = useSaveExpense(EXPENSE_RESOURCES.recurring);
  const deleteRecurring = useDeleteExpense(EXPENSE_RESOURCES.recurring);
  const [dialogOpen, setDialogOpen] = useState(false);
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const generate = useGenerateRecurring();

  const generateMonth = () =>
    generate.mutate(
      { month, year },
      {
        onSuccess: ({ created, skipped }) => {
          const missing = skipped.filter((item) => item.reason !== "already_generated").length;
          toast.success(
            created.length
              ? `${created.length} gastos creados como pendientes en ${getMonthName(month)}`
              : `${getMonthName(month)} ya estaba generado`,
            missing ? { description: `${missing} sin tarjeta o categoría: complétalos para generarlos.` } : undefined,
          );
        },
      },
    );

  const totalMonthly = recurring
    .filter((r) => r.isActive)
    .reduce((sum, r) => sum + r.amount, 0);

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{recurring.filter((r) => r.isActive).length} activos</p>
          <p className="text-2xl font-bold">{formatCurrency(totalMonthly)} <span className="text-sm font-normal text-muted-foreground">/mes estimado</span></p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={generateMonth} disabled={generate.isPending}>
            <CalendarPlus className="mr-1 h-4 w-4" /> Generar {getMonthName(month).toLowerCase()}
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Nuevo recurrente
          </Button>
        </div>
      </div>

      {recurring.length === 0 && <EmptyState description="No hay gastos recurrentes configurados" />}

      <div className="grid gap-3 sm:grid-cols-2">
        {recurring.map((rec) => {
          const cat = categories.find((c) => c.id === rec.categoryId);

          return (
            <Card key={rec.id} className={!rec.isActive ? "opacity-60" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{rec.description}</h3>
                    <p className="text-lg font-bold">{formatCurrency(rec.amount)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rec.isActive}
                      onCheckedChange={(v) => saveRecurring.mutate({ id: rec.id, body: { isActive: v } })}
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRecurring.mutate(rec.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline">{TARGET_LABELS[rec.targetType]}</Badge>
                  {cat && (
                    <Badge style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                      {cat.name}
                    </Badge>
                  )}
                  {rec.paymentMethodId && <Badge variant="secondary">{accountName(rec.paymentMethodId)}</Badge>}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Día {rec.dayOfMonth}
                  </Badge>
                  <Badge variant="outline">{personName(rec.personId)}</Badge>
                </div>
                {rec.lastGeneratedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Generado hasta {getMonthName(Number(rec.lastGeneratedAt.slice(5, 7))).toLowerCase()}{" "}
                    {rec.lastGeneratedAt.slice(0, 4)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <RecurringDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

export const RecurringList = withQuery(RecurringListView);
