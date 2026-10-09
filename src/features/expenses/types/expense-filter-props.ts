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
  searchInPanel?: boolean;
  primaryControls?: ReactNode;
  rightActions?: ReactNode;
  appliedFilters?: ReactNode;
  viewToggle?: ReactNode;
  showActiveSummary?: boolean;
}

export type ExpenseFilterFieldsProps = Pick<
  ExpenseFiltersProps,
  | "fields"
  | "value"
  | "onChange"
  | "statuses"
  | "personInPanel"
  | "searchInPanel"
> & {
  panel: boolean;
  personCounts?: Record<string, number>;
  activeMarkers?: boolean;
  showIcons?: boolean;
  fullWidth?: boolean;
  wrapAdditionalFilters?: boolean;
  statusAllLabel?: string;
  sharedOwnLabel?: string;
};

export interface ActiveExpenseFilterChipsOptions<
  T extends string | string[] = string,
> {
  fields: ExpenseFilterKey[];
  value: ExpenseFilterValues;
  onChange: (value: ExpenseFilterValues) => void;
  me?: string;
  groupBy?: T;
  onGroupByChange?: (value: T) => void;
  groupByLabel?: string;
  groupByLabels?: Record<string, string>;
  periodChip?: { key?: string; label: string; onRemove: () => void };
  formatFilterLabel?: (key: ExpenseFilterKey, defaultLabel: string) => string;
  showClearAll?: boolean;
  onClearAll?: () => void;
}

export interface ActiveExpenseFilterChipsProps<
  T extends string | string[] = string,
> extends ActiveExpenseFilterChipsOptions<T> {
  tone?: "default" | "brand";
  maxVisibleItems?: number;
  collapsible?: boolean;
  showCollapseLabel?: boolean;
}
