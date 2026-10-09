import type { LucideIcon } from "lucide-react";

import { useBudgetGroups, useCategories } from "@/shared/api/hooks/catalogs";
import { CategoryIcon } from "@/shared/components/data-display/CategoryIcon";
import { MultiSelect } from "@/shared/components/filters/MultiSelect";

export interface CategoryFilterFieldsProps {
  value?: string | null;
  onChange: (value: string | undefined) => void;
  label?: string;
  allLabel?: string;
  activeMarker?: boolean;
  icon?: LucideIcon;
  width?: string;
  labelClassName?: string;
  presentation?: "popover" | "inline" | "responsive-sheet";
  counts?: Record<string, number>;
  multiple?: boolean;
  emptySelectionLabel?: string;
  allowEmptySelection?: boolean;
  triggerClassName?: string;
}

const UNGROUPED = "Sin grupo";

export function CategoryFilterFields({
  value,
  onChange,
  label = "Categoría",
  allLabel = "Todas las categorías",
  activeMarker = false,
  icon,
  width = "w-full",
  labelClassName = "text-sm font-medium",
  presentation = "responsive-sheet",
  counts,
  multiple = true,
  emptySelectionLabel = "Ninguna categoría",
  allowEmptySelection = false,
  triggerClassName,
}: CategoryFilterFieldsProps) {
  const categories = useCategories().data ?? [];
  const budgetGroups = useBudgetGroups().data ?? [];
  const selected = value?.split(",").filter(Boolean) ?? [];
  const groupById = new Map(budgetGroups.map((group) => [group.id, group]));
  const options = [...categories]
    .sort((left, right) => {
      const leftGroup = left.budgetGroupId
        ? groupById.get(left.budgetGroupId)
        : undefined;
      const rightGroup = right.budgetGroupId
        ? groupById.get(right.budgetGroupId)
        : undefined;
      return (
        (leftGroup?.order ?? Number.MAX_SAFE_INTEGER) -
          (rightGroup?.order ?? Number.MAX_SAFE_INTEGER) ||
        (leftGroup?.name ?? UNGROUPED).localeCompare(
          rightGroup?.name ?? UNGROUPED,
          "es",
        ) ||
        left.name.localeCompare(right.name, "es")
      );
    })
    .map((category) => {
      const group = category.budgetGroupId
        ? groupById.get(category.budgetGroupId)
        : undefined;
      return {
        value: category.id,
        label: category.name,
        group: group?.name ?? UNGROUPED,
        groupDecoration: group?.emoji ? (
          <span aria-hidden="true" className="text-sm leading-none">
            {group.emoji}
          </span>
        ) : undefined,
        decoration: (
          <CategoryIcon icon={category.icon} color={category.color} size="xs" />
        ),
        searchTerms: [group?.name ?? UNGROUPED],
        count: counts?.[category.id],
      };
    });

  return (
    <MultiSelect
      label={label}
      value={selected}
      options={options}
      onChange={(next) => onChange(next?.join(",") || undefined)}
      width={width}
      allLabel={allLabel}
      emptySelectionLabel={emptySelectionLabel}
      activeMarker={activeMarker}
      icon={icon}
      labelClassName={labelClassName}
      emptyDescription={(query) => (
        <>
          Ninguna categoría coincide con «{query}».
          <br />
          Las categorías salen de las categorías configuradas.
        </>
      )}
      emptyValueMeansAll={multiple}
      multiple={multiple}
      allowEmptySelection={allowEmptySelection}
      showSelectionFooter={multiple}
      triggerClassName={triggerClassName}
      summaryMode="category"
      presentation={presentation}
      hierarchicalGroups
      circularSelectionMarks
      listClassName="max-h-[min(70vh,38rem)]"
    />
  );
}
