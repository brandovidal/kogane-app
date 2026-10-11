import { useState } from "react";
import { Gauge, Pencil, Plus } from "lucide-react";

import { BudgetGroupDialog } from "@/features/budget-groups/components/BudgetGroupDialog";
import { useBudgetGroupSummaries } from "@/features/budget-groups/hooks/useBudgetGroupSummaries";
import { CategoryDialog } from "@/features/categories/components/CategoryDialog";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import { CategoryLimitDialog } from "@/features/categories/components/CategoryLimitDialog";
import { useCategoryBudgets } from "@/features/categories/hooks/category-budgets";
import { useSummary } from "@/features/budget/hooks/summary";
import { SalaryDialog } from "@/features/budget/components/dialogs/SalaryDialog";
import { useCategories } from "@/shared/api/hooks/catalogs";
import type { BudgetGroup, Category } from "@/shared/api/types";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { ViewToggle } from "@/shared/components/data-display/ViewToggle";
import { formatCurrency } from "@/shared/lib/currency";
import { usePeriod } from "@/shared/stores/period.store";
import { Button } from "@/ui/button";
import { Progress } from "@/ui/progress";
import { BudgetSwitches } from "./BudgetSwitches";
import { STATUS_TEXT } from "../lib/budget-view";
import {
  buildOverview,
  type OverviewCategory,
  type OverviewGroup,
} from "../lib/budget-overview";

function Stat({
  label,
  value,
  hint,
  action,
}: {
  label: string;
  value: string;
  hint: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-4">
      <p className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        {action}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function UsageBar({ category }: { category: OverviewCategory }) {
  if (category.limit == null)
    return <span className="text-xs text-muted-foreground">Sin límite</span>;
  return (
    <div className="flex items-center gap-2">
      <Progress
        value={Math.min(category.percent, 100)}
        className={`h-2 w-28 ${category.status === "over" ? "[&>div]:bg-destructive" : category.status === "warning" ? "[&>div]:bg-amber-500" : ""}`}
      />
      <span className={`text-xs tabular-nums ${STATUS_TEXT[category.status]}`}>
        {category.percent} %
      </span>
    </div>
  );
}

// Presupuesto ▸ Resumen: salary and limit, what counts, and every group with its categories, limits and use (D78, D96)
export function BudgetOverview() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const summary = useSummary(month, year).data;
  const { summaries } = useBudgetGroupSummaries(month, year);
  const lines = useCategoryBudgets(month, year).data ?? [];
  const categories = useCategories().data ?? [];
  const [view, setView] = useViewMode("budget-overview", "cards");
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [groupDialog, setGroupDialog] = useState<{
    open: boolean;
    group?: BudgetGroup;
  }>({ open: false });
  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    category?: Category;
  }>({ open: false });
  const [limitOf, setLimitOf] = useState<OverviewCategory | null>(null);

  const { groups, totals } = buildOverview(summaries, lines);
  const budget = summary?.budget;
  const salary = budget?.salary ?? 0;
  const groupOf = (id: string) =>
    summaries.find((s) => s.group.id === id)?.group;
  const categoryOf = (id: string) => categories.find((c) => c.id === id);
  const assignedPercent = groups.reduce((sum, g) => sum + g.percentage, 0);

  const categoryRow = (category: OverviewCategory) => (
    <div
      key={category.id}
      className="grid grid-cols-[minmax(0,1.4fr)_110px_110px_minmax(0,1fr)_72px] items-center gap-3 border-t px-4 py-2.5 text-sm"
    >
      <span className="flex min-w-0 items-center gap-2">
        <CategoryIcon icon={category.icon} color={category.color} size="sm" />
        <span className="truncate">{category.name}</span>
      </span>
      <span className="text-right tabular-nums">
        {formatCurrency(category.spent)}
      </span>
      <span className="text-right tabular-nums">
        {category.limit != null ? (
          formatCurrency(category.limit)
        ) : (
          <button
            type="button"
            className="text-primary underline-offset-2 hover:underline"
            onClick={() => setLimitOf(category)}
          >
            Poner límite
          </button>
        )}
      </span>
      <UsageBar category={category} />
      <span className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label={`Editar ${category.name}`}
          onClick={() =>
            setCategoryDialog({ open: true, category: categoryOf(category.id) })
          }
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label={`Límite de ${category.name}`}
          onClick={() => setLimitOf(category)}
        >
          <Gauge className="h-3.5 w-3.5" />
        </Button>
      </span>
    </div>
  );

  const groupBlock = (group: OverviewGroup) => (
    <section key={group.id} className="overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 bg-muted/40 px-4 py-3">
        <p className="min-w-40 font-medium">
          {group.emoji} {group.name}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            {group.percentage} %
          </span>
        </p>
        <p className="text-sm tabular-nums">
          {formatCurrency(group.spent)}{" "}
          <span className="text-xs text-muted-foreground">gastado</span>
        </p>
        <p className="text-sm tabular-nums">
          {formatCurrency(group.assigned)}{" "}
          <span className="text-xs text-muted-foreground">asignado</span>
        </p>
        <p
          className={`text-sm tabular-nums ${group.available < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
        >
          {formatCurrency(group.available)}{" "}
          <span className="text-xs text-muted-foreground">disponible</span>
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-7 w-7"
          aria-label={`Editar ${group.name}`}
          onClick={() =>
            setGroupDialog({ open: true, group: groupOf(group.id) })
          }
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
      {group.categories.length === 0 ? (
        <p className="border-t px-4 py-3 text-sm text-muted-foreground">
          Sin categorías en este grupo.
        </p>
      ) : (
        group.categories.map(categoryRow)
      )}
    </section>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Sueldo mensual"
          value={formatCurrency(salary)}
          hint={`${assignedPercent} % asignado a grupos`}
          action={
            <button
              type="button"
              className="text-xs text-primary underline-offset-2 hover:underline"
              onClick={() => setSalaryOpen(true)}
            >
              Editar
            </button>
          }
        />
        <Stat
          label="Límite de gasto"
          value={formatCurrency(budget?.limit ?? 0)}
          hint={`${budget?.limitPercent ?? 0} % del sueldo`}
        />
        <Stat
          label="Gastado"
          value={formatCurrency(summary?.spentPen ?? 0)}
          hint={`${totals.percent} % de lo asignado`}
        />
        <Stat
          label="Disponible"
          value={formatCurrency(summary?.surplus ?? 0)}
          hint="Sueldo + extras − gastado"
        />
      </div>

      <BudgetSwitches />

      <div className="flex flex-wrap items-center gap-2">
        <ViewToggle view={view} onChange={setView} showLabels />
        <span className="flex-1" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCategoryDialog({ open: true })}
        >
          <Plus className="mr-1 h-4 w-4" /> Nueva categoría
        </Button>
        <Button size="sm" onClick={() => setGroupDialog({ open: true })}>
          <Plus className="mr-1 h-4 w-4" /> Nuevo grupo
        </Button>
      </div>

      {view === "cards" ? (
        <div className="space-y-4">{groups.map(groupBlock)}</div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="grid grid-cols-[minmax(0,1.4fr)_150px_110px_110px_minmax(0,1fr)] gap-3 bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <span>Categoría</span>
            <span>Grupo</span>
            <span className="text-right">Límite</span>
            <span className="text-right">Gastado</span>
            <span>Uso</span>
          </div>
          {groups.flatMap((group) =>
            group.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setLimitOf(category)}
                className="grid w-full grid-cols-[minmax(0,1.4fr)_150px_110px_110px_minmax(0,1fr)] items-center gap-3 border-t px-4 py-2.5 text-left text-sm hover:bg-muted/30"
              >
                <span className="truncate">{category.name}</span>
                <span className="truncate text-muted-foreground">
                  {group.emoji} {group.name}
                </span>
                <span className="text-right tabular-nums">
                  {category.limit != null
                    ? formatCurrency(category.limit)
                    : "—"}
                </span>
                <span className="text-right tabular-nums">
                  {formatCurrency(category.spent)}
                </span>
                <UsageBar category={category} />
              </button>
            )),
          )}
          <div className="grid grid-cols-[minmax(0,1.4fr)_150px_110px_110px_minmax(0,1fr)] gap-3 border-t bg-muted/40 px-4 py-2.5 text-sm font-semibold">
            <span>Total</span>
            <span />
            <span className="text-right tabular-nums">
              {formatCurrency(totals.limit)}
            </span>
            <span className="text-right tabular-nums">
              {formatCurrency(totals.spent)}
            </span>
            <span className="tabular-nums">{totals.percent} %</span>
          </div>
        </div>
      )}

      <BudgetGroupDialog
        open={groupDialog.open}
        onOpenChange={(open) => setGroupDialog((s) => ({ ...s, open }))}
        group={groupDialog.group}
      />
      <CategoryDialog
        open={categoryDialog.open}
        onOpenChange={(open) => setCategoryDialog((s) => ({ ...s, open }))}
        category={categoryDialog.category}
      />
      {limitOf && categoryOf(limitOf.id) && (
        <CategoryLimitDialog
          category={categoryOf(limitOf.id)!}
          line={limitOf.line}
          month={month}
          year={year}
          onClose={() => setLimitOf(null)}
        />
      )}
      {salaryOpen && (
        <SalaryDialog
          open
          onOpenChange={setSalaryOpen}
          initialPeriod={{ month, year }}
          onSaved={() => setSalaryOpen(false)}
        />
      )}
    </div>
  );
}
