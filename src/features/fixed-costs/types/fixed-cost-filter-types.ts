import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";

export interface FixedCostFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  shown: number;
  total: number;
  filterCount: number;
  onClear: () => void;
  showPeriod: boolean;
  personCounts: Record<string, number>;
}
