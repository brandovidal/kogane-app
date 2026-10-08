import { Button } from "@/ui/button";
import { FilterSheetShell } from "@/shared/components/filters/FilterSheetShell";
import { SheetTitle } from "@/ui/sheet";
import { ExpenseFilterFields } from "@/features/expenses/components/filters/ExpenseFilterFields";
import type { ExpenseFilterValues, ExpenseFilterKey } from "@/features/expenses/types/expense-filters";
import { CREDIT_CARD_STATUSES } from "../../constants/statuses";

export function CardOverviewFilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  fields,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  fields: ExpenseFilterKey[];
}) {
  return (
    <FilterSheetShell
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="w-[min(24rem,calc(100vw-1rem))]"
      bodyClassName="px-4 pb-4"
      footerClassName="border-t p-4"
      header={<SheetTitle>Filtros</SheetTitle>}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mr-auto"
            onClick={() => onFiltersChange({ q: filters.q })}
          >
            Limpiar filtros
          </Button>
          <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
            Ver resultados
          </Button>
        </>
      }
    >
      <ExpenseFilterFields
        fields={fields}
        value={filters}
        onChange={onFiltersChange}
        statuses={CREDIT_CARD_STATUSES}
        panel
        personInPanel
      />
    </FilterSheetShell>
  );
}
