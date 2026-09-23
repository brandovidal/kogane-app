import { useState } from "react";
import { useCategories, useDeleteCategory } from "@/shared/api/hooks/catalogs";
import { EXPENSE_RESOURCES, type Category } from "@/shared/api/types";
import { useExpenses } from "@/shared/api/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { usePeriod } from "@/shared/stores/period.store";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { Plus, Trash2, Pencil, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/shared/lib/currency";
import { CategoryDialog } from "./CategoryDialog";

// Category budgets with alerts arrive with P19; until then every category shows what was spent
const budgets: { categoryId: string; monthlyLimit: number; alertThreshold: number }[] = [];

function CategoryManagerView() {
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const categories = useCategories().data ?? [];
  const fixedCosts = useExpenses(EXPENSE_RESOURCES.fixedCost, { month: selectedMonth, year: selectedYear }).data ?? [];
  const deleteCategory = useDeleteCategory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} categorías</p>
        <Button size="sm" onClick={() => { setEditingCategory(undefined); setDialogOpen(true); }}><Plus className="mr-1 h-4 w-4" /> Nueva categoría</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const budget = budgets.find((b) => b.categoryId === cat.id);
          const spent = fixedCosts
            .filter((fc) => fc.categoryId === cat.id)
            .reduce((sum, fc) => sum + (fc.amountInPen ?? fc.amount), 0);
          const percent = budget ? (spent / budget.monthlyLimit) * 100 : 0;
          const isOverBudget = budget && percent > 100;
          const isNearLimit = budget && percent >= budget.alertThreshold;

          return (
            <Card key={cat.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded" style={{ backgroundColor: cat.color }} />
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    {!cat.isDefault && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingCategory(cat); setDialogOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCategory.mutate(cat.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {cat.isDefault && <Badge variant="outline" className="text-xs">Default</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {budget ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Gastado: {formatCurrency(spent)}</span>
                      <span className="text-muted-foreground">de {formatCurrency(budget.monthlyLimit)}</span>
                    </div>
                    <Progress
                      value={Math.min(percent, 100)}
                      className={`h-2 ${isOverBudget ? "[&>div]:bg-red-500" : isNearLimit ? "[&>div]:bg-yellow-500" : ""}`}
                    />
                    {isOverBudget && (
                      <div className="flex items-center gap-1 text-xs text-red-500">
                        <AlertTriangle className="h-3 w-3" />
                        Excedido por {formatCurrency(spent - budget.monthlyLimit)}
                      </div>
                    )}
                    {isNearLimit && !isOverBudget && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        {percent.toFixed(0)}% del presupuesto
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Gastado: {formatCurrency(spent)} | Sin presupuesto
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
      />
    </div>
  );
}

export const CategoryManager = withQuery(CategoryManagerView);
