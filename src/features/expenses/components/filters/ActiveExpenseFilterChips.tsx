import { AppliedFilterChips } from "@/shared/components/filters/AppliedFilterChips";
import type { ActiveExpenseFilterChipsProps } from "../../types/expense-filter-props";
import { useActiveExpenseFilterChips } from "../../hooks/useActiveExpenseFilterChips";

export function ActiveExpenseFilterChips<T extends string | string[] = string>({
  fields,
  value,
  onChange,
  me,
  groupBy,
  onGroupByChange,
  groupByLabel,
  groupByLabels,
  periodChip,
  formatFilterLabel,
  tone,
  maxVisibleItems,
  collapsible = true,
  showCollapseLabel,
  showClearAll = true,
  onClearAll,
}: ActiveExpenseFilterChipsProps<T>) {
  const { chips, isGrouped } = useActiveExpenseFilterChips({
    fields,
    value,
    onChange,
    me,
    groupBy,
    onGroupByChange,
    groupByLabel,
    groupByLabels,
    periodChip,
    formatFilterLabel,
    showClearAll,
    onClearAll,
  });

  if (!chips.length && !(isGrouped && onGroupByChange)) return null;

  return (
    <AppliedFilterChips
      items={chips}
      ariaLabel="Filtros y agrupación activos"
      collapsible={collapsible}
      tone={tone}
      maxVisibleItems={maxVisibleItems}
      showCollapseLabel={showCollapseLabel}
    />
  );
}
