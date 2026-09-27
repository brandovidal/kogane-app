import { useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { useDeleteIncome, useIncomes, type Income } from "../hooks/budget";
import { IncomeDialog } from "./IncomeDialog";
import { incomeColumns } from "../lib/income-columns";
import { incomeTotals } from "../lib/income-totals";
import { IncomeSummarySection } from "../sections/IncomeSummarySection";
import { useSummary } from "@/features/budget/hooks/summary";
import { SalaryDialog } from "@/features/budget/components/dialogs/SalaryDialog";
import { withQuery } from "@/shared/api/query";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { DataView } from "@/shared/components/data-display/DataView";
import { ViewToggle } from "@/shared/components/data-display/ViewToggle";
import { PeriodFields } from "@/shared/components/forms/PeriodFields";
import { DeleteConfirmationDialog } from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { PERIOD_YEAR_MIN, PERIOD_YEAR_MAX } from "@/shared/constants/period";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { useUrlPeriod } from "@/shared/hooks/useUrlPeriod";
import { getMonthName } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";
import type { MonthlyPeriod } from "@/shared/types/period";
import { Button } from "@/ui/button";

function IncomesPageView() {
  useUrlPeriod({ minYear: PERIOD_YEAR_MIN, maxYear: PERIOD_YEAR_MAX });
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const setPeriod = usePeriod((state) => state.setPeriod);
  const changePeriod = (period: MonthlyPeriod) =>
    setPeriod(period.month, period.year);
  const query = useIncomes(month, year);
  const summary = useSummary(month, year);
  const incomes = query.data ?? [];
  const deleteIncome = useDeleteIncome();
  const [editing, setEditing] = useState<Income | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Income | null>(null);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [view, setView] = useViewMode("incomes", "table");
  const columns = incomeColumns({
    onEdit: setEditing,
    onDelete: setDeleting,
    deleting: deleteIncome.isPending,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            Ingresos de {getMonthName(month)} {year}
          </h2>
          <p className="text-sm text-muted-foreground">
            Gestiona el sueldo y los ingresos extra de cada mes.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <PeriodFields
            value={{ month, year }}
            onChange={changePeriod}
            ariaLabel="Mes de ingresos"
          />
        </div>
      </div>

      {summary.isPending && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Cargando sueldo del mes…
        </p>
      )}
      {summary.isError && (
        <div role="alert" className="flex flex-wrap items-center gap-2 text-sm">
          <p>No se pudo cargar el sueldo del mes.</p>
          <Button size="sm" variant="outline" onClick={() => summary.refetch()}>
            Reintentar
          </Button>
        </div>
      )}
      <IncomeSummarySection
        budget={summary.isError ? undefined : summary.data?.budget}
        totals={
          query.data && !query.isError ? incomeTotals(incomes) : undefined
        }
        onEditSalary={() => setSalaryOpen(true)}
      />

      <section className="space-y-4" aria-labelledby="extra-incomes-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="extra-incomes-title" className="text-base font-semibold">
              Ingresos extra
            </h2>
            {query.data && !query.isError && (
              <p className="text-xs text-muted-foreground">
                {incomes.length} registros en este mes
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle value={view} onChange={setView} />
            <Button size="sm" onClick={() => setEditing(null)}>
              <Plus aria-hidden="true" />
              Nuevo ingreso extra
            </Button>
          </div>
        </div>
        {query.isPending ? (
          <p
            role="status"
            className="flex items-center gap-2 py-8 text-sm text-muted-foreground"
          >
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Cargando ingresos extra…
          </p>
        ) : query.isError ? (
          <div role="alert" className="space-y-3 rounded-lg border p-4 text-sm">
            <p>No se pudieron cargar los ingresos extra.</p>
            <Button size="sm" variant="outline" onClick={() => query.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : incomes.length === 0 ? (
          <EmptyState description="No hay ingresos extra en este mes" />
        ) : (
          <DataView
            items={incomes}
            columns={columns}
            rowKey={(income) => income.id}
            view={view}
          />
        )}
      </section>

      {editing !== undefined && (
        <IncomeDialog
          income={editing}
          period={{ month, year }}
          onClose={() => setEditing(undefined)}
          onSaved={changePeriod}
        />
      )}
      {salaryOpen && (
        <SalaryDialog
          open
          onOpenChange={setSalaryOpen}
          initialPeriod={{ month, year }}
          onSaved={changePeriod}
        />
      )}
      <DeleteConfirmationDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Eliminar ingreso"
        description={
          <>
            Se eliminará «{deleting?.description}» y se actualizará el total de
            su mes. Esta acción no se puede deshacer.
          </>
        }
        pending={deleteIncome.isPending}
        onConfirm={() => {
          if (deleting)
            deleteIncome.mutate(deleting.id, {
              onSuccess: () => setDeleting(null),
            });
        }}
      />
    </div>
  );
}

export const IncomesPage = withQuery(IncomesPageView);
