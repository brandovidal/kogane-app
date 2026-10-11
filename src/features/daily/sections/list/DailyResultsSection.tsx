import type { Category, DailyExpense } from "@/shared/api/types";
import type { Column, ViewMode } from "@/shared/types/data-view";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { GroupedDataView } from "@/shared/components/data-display/GroupedDataView";
import { Button } from "@/ui/button";
import { DailyCalendar } from "../../views/DailyCalendarView";
import { dayKey, dayLabel } from "../../lib/day-label";
import type { DailyLayout } from "../../types/daily-types";

type CatalogName = (id?: string | null) => string;

export interface DailyResultsSectionProps {
  expenses: DailyExpense[];
  totalExpenses: number;
  loading: boolean;
  personIds: string[];
  categories: Category[];
  personName: CatalogName;
  categoryName: CatalogName;
  columns: Column<DailyExpense>[];
  view: ViewMode;
  groupBy: string;
  hideEmptyGroups: boolean;
  layout: DailyLayout;
  year: number;
  month: number;
  today: Date | null;
  onEdit: (expense: DailyExpense) => void;
  onNewExpense: () => void;
  selected: Set<string>;
  onSelectedChange: (selected: Set<string>) => void;
}

export function DailyResultsSection({
  expenses,
  totalExpenses,
  loading,
  personIds,
  categories,
  personName,
  categoryName,
  columns,
  view,
  groupBy,
  hideEmptyGroups,
  layout,
  year,
  month,
  today,
  onEdit,
  onNewExpense,
  selected,
  onSelectedChange,
}: DailyResultsSectionProps) {
  if (loading) return null;

  if (expenses.length === 0) {
    return totalExpenses ? (
      <EmptyState
        variant="filters"
        title="Sin resultados"
        description="No hay gastos con estos filtros"
      />
    ) : (
      <EmptyState
        variant="period"
        title="Sin gastos este mes"
        description="Registra tu primer gasto o mándalo por Mensajes: una captura, un audio o un texto basta."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={onNewExpense}>
              Nuevo gasto
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/mensajes">Ir a Mensajes</a>
            </Button>
          </div>
        }
      />
    );
  }

  if (layout === "calendar") {
    return (
      <DailyCalendar
        year={year}
        month={month}
        expenses={expenses}
        onEdit={onEdit}
        onNewExpense={onNewExpense}
      />
    );
  }

  return (
    <GroupedDataView
      items={expenses}
      columns={columns}
      rowKey={(expense) => expense.id}
      view={view}
      groupBy={layout === "day" ? "day" : groupBy}
      hideEmptyGroups={hideEmptyGroups}
      selected={selected}
      onSelectedChange={onSelectedChange}
      knownGroups={(field) =>
        field === "person"
          ? personIds
          : field === "category"
            ? categories.map((category) => category.id)
            : undefined
      }
      groupKey={(expense, key) =>
        key === "day"
          ? dayKey(expense.spentAt)
          : key === "person"
            ? (expense.personId ?? "none")
            : (expense.categoryId ?? "none")
      }
      groupLabel={(key, field) =>
        field === "day"
          ? dayLabel(key, today)
          : key === "none"
            ? "Sin asignar"
            : field === "person"
              ? personName(key)
              : categoryName(key)
      }
    />
  );
}
