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
  tone,
  maxVisibleItems,
  collapsible = true,
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
    />
  );
}
