import { Upload } from "lucide-react";

import { DailyIndicators } from "../components/DailyIndicators";
import { DailyViewBar } from "../sections/list/DailyViewBar";
import { DailyResultsSection } from "../sections/list/DailyResultsSection";
import { useDailyActions } from "../hooks/useDailyActions";
import { useDailyList } from "../hooks/useDailyList";
import { createDailyExpenseColumns } from "../lib/daily-columns";
import { ExpenseFilters } from "@/features/expenses/components/filters/ExpenseFilters";
import { ExpenseEditDialog } from "@/features/expenses/components/ExpenseEditDialog";
import { OriginMessageDialog } from "@/features/drafts/components/OriginMessageDialog";
import { ImportListDialog } from "@/features/imports/components/ImportListDialog";
import { useCsvExport } from "@/shared/hooks/useCsvExport";
import { ViewToggle } from "@/shared/components/data-display/ViewToggle";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { DAILY_FILTERS } from "../constants/daily";

function DailyListPageContent() {
  const list = useDailyList();
  const actions = useDailyActions();

  const columns = createDailyExpenseColumns({
    categories: list.categories,
    methodName: list.methodName,
    personName: list.personName,
    onEdit: actions.setEditing,
    onOrigin: actions.setOrigin,
    onDuplicate: actions.onDuplicate,
    onDelete: actions.onDelete,
  });
  const csv = useCsvExport({
    filename: `dia-a-dia-${list.year}-${String(list.month).padStart(2, "0")}`,
    headers: [
      "Descripción",
      "Fecha",
      "Monto",
      "Moneda",
      "Medio de pago",
      "Persona",
      "Categoría",
    ],
    rows: list.sorted.map((expense) => [
      expense.description,
      expense.spentAt.slice(0, 10),
      expense.amount,
      expense.currency,
      list.methodName(expense.paymentMethodId),
      list.personName(expense.personId),
      list.categoryName(expense.categoryId),
    ]),
  });
  const exportItems = [
    ...csv.items,
    {
      label: "Importar lista",
      icon: <Upload aria-hidden="true" />,
      onSelect: () => actions.setImporting(true),
    },
  ];

  if (list.isLoading) return null;

  return (
    <div className="space-y-4">
      <DailyViewBar
        layout={list.layout}
        onLayoutChange={list.setLayout}
        exportItems={exportItems}
      />

      <DailyIndicators
        expenses={list.sorted}
        month={list.month}
        year={list.year}
      />

      <ExpenseFilters
        fields={DAILY_FILTERS}
        value={list.filters}
        onChange={list.setFilters}
        shown={list.sorted.length}
        total={list.expenses.length}
        groupBy={list.layout === "day" ? "day" : list.groupBy}
        onGroupByChange={(next) => {
          list.setGroupBy(next);
          if (list.layout === "day") list.setLayout("list");
        }}
        hideEmptyGroups={list.hideEmpty}
        onHideEmptyGroupsChange={list.setHideEmpty}
        groupByOptions={
          list.layout === "calendar"
            ? undefined
            : [
                { value: "day", label: "Por día" },
                { value: "person", label: "Por persona" },
                { value: "category", label: "Por categoría" },
              ]
        }
        rightActions={
          list.layout === "calendar" ? undefined : (
            <ViewToggle value={list.view} onChange={list.setView} showLabels />
          )
        }
      />

      <DailyResultsSection
        expenses={list.sorted}
        totalExpenses={list.expenses.length}
        loading={list.isLoading}
        personIds={list.people.map((person) => person.id)}
        categories={list.categories}
        personName={list.personName}
        categoryName={list.categoryName}
        columns={columns}
        view={list.view}
        groupBy={list.groupBy}
        hideEmptyGroups={list.hideEmpty}
        layout={list.layout}
        year={list.year}
        month={list.month}
        today={list.today}
        onEdit={actions.setEditing}
        onNewExpense={() => actions.openNewExpense({ destination: "daily" })}
      />

      {actions.origin?.draftId && (
        <OriginMessageDialog
          draftId={actions.origin.draftId}
          title={actions.origin.description}
          onClose={() => actions.setOrigin(undefined)}
        />
      )}

      <ImportListDialog
        open={actions.importing}
        onOpenChange={actions.setImporting}
        target="daily-expenses"
        title="Importar gastos del día a día"
      />

      <ExpenseEditDialog
        open={!!actions.editing}
        onOpenChange={(open) => !open && actions.setEditing(undefined)}
        resource={EXPENSE_RESOURCES.daily}
        expense={actions.editing}
      />
    </div>
  );
}

export const DailyListPage = withQuery(DailyListPageContent);
