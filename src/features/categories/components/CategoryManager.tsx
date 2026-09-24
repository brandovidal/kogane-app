import { useState } from "react";
import { useCategories, useDeleteCategory } from "@/shared/api/hooks/catalogs";
import type { Category } from "@/shared/api/types";
import { useCategoryBudgets, useDeleteCategoryBudget, useSaveCategoryBudget, type CategoryBudgetLine } from "@/shared/api/hooks/budget";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { withQuery } from "@/shared/api/query";
import { usePeriod } from "@/shared/stores/period.store";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { Plus, Trash2, Pencil, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/shared/lib/currency";
import { CategoryDialog } from "./CategoryDialog";

// Categorías (D78): what you spent this month against the limit of each one (GET /v1/category-budgets, your part only);
// the limit is for every month or only for the month on screen, with an alert at its threshold

function CategoryManagerView() {
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const categories = useCategories().data ?? [];
  const lines = useCategoryBudgets(selectedMonth, selectedYear).data ?? [];
  const [limitOf, setLimitOf] = useState<{ category: Category; line?: CategoryBudgetLine } | undefined>();
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
          const line = lines.find((item) => item.categoryId === cat.id);
          const spent = line?.spent ?? 0;
          const limit = line?.limit ?? null;
          const percent = line?.percent ?? 0;
          const isOverBudget = line?.status === "over";
          const isNearLimit = line?.status === "warning";

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
                {limit != null ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Gastado: {formatCurrency(spent)}</span>
                      <span className="text-muted-foreground">
                        de {formatCurrency(limit)} {line?.limitMonthOnly ? "(solo este mes)" : "/ mes"}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percent, 100)}
                      className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-amber-500" : ""}`}
                    />
                    {isOverBudget && (
                      <div className="flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        Excedido por {formatCurrency(spent - limit)}
                      </div>
                    )}
                    {isNearLimit && (
                      <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" /> {Math.round(percent)} % del límite
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Gastado: {formatCurrency(spent)} · sin límite</p>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setLimitOf({ category: cat, line })}>
                  {limit != null ? "Editar límite" : "Poner límite"}
                </Button>
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
      {limitOf && (
        <LimitDialog
          category={limitOf.category}
          line={limitOf.line}
          month={selectedMonth}
          year={selectedYear}
          onClose={() => setLimitOf(undefined)}
        />
      )}
    </div>
  );
}

export const CategoryManager = withQuery(CategoryManagerView);

// The limit of one category: for every month, or only the month on screen (it replaces the general one then)
function LimitDialog({
  category,
  line,
  month,
  year,
  onClose,
}: {
  category: Category;
  line?: CategoryBudgetLine;
  month: number;
  year: number;
  onClose: () => void;
}) {
  const save = useSaveCategoryBudget();
  const remove = useDeleteCategoryBudget();
  const [limit, setLimit] = useState(line?.limit != null ? String(line.limit) : "");
  const [threshold, setThreshold] = useState(String(line?.alertThreshold ?? 80));
  const [monthOnly, setMonthOnly] = useState(line?.limitMonthOnly ?? false);
  const valid = Number(limit) > 0 && Number(threshold) >= 1 && Number(threshold) <= 100;

  const submit = () =>
    save.mutate(
      {
        categoryId: category.id,
        monthlyLimit: Number(limit),
        alertThreshold: Number(threshold),
        ...(monthOnly ? { month, year } : { month: null, year: null }),
      },
      { onSuccess: onClose },
    );

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Límite de ${category.name}`}
      description="El bot avisa al cruzar la alerta y al pasar el 100 %."
      footer={
        <>
          {line?.budgetId && (
            <Button variant="ghost" className="mr-auto text-destructive" onClick={() => remove.mutate(line.budgetId as string, { onSuccess: onClose })}>
              Quitar límite
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={!valid || save.isPending}>Guardar</Button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Límite mensual (S/)</span>
          <Input type="number" min="0" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Alerta al (%)</span>
          <Input type="number" min="1" max="100" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={monthOnly} onCheckedChange={setMonthOnly} /> Solo este mes (si no, para todos los meses)
        </label>
      </div>
    </ResponsiveDialog>
  );
}
