import type { ReactNode } from "react";
import type { ExpenseFilterKey, ExpenseFilterValues } from "./expense-filters";

export interface ExpenseFiltersProps {
  fields: ExpenseFilterKey[];
  value: ExpenseFilterValues;
  onChange: (value: ExpenseFilterValues) => void;
  statuses?: string[]; // the payment statuses of that table
  shown: number;
  total: number;
  groupBy?: string;
  onGroupByChange?: (value: string) => void;
  groupByOptions?: { value: string; label: string }[];
  personInPanel?: boolean;
  description?: string;
  countLabel?: string;
  compactCountInTitle?: boolean;
  floatingFilterCount?: boolean;
  searchInPanelBelowTablet?: boolean;
  primaryControls?: ReactNode;
  rightActions?: ReactNode;
  appliedFilters?: ReactNode;
  viewToggle?: ReactNode;
  showActiveSummary?: boolean;
}
