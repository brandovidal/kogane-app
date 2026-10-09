import { CategoryFilterFields } from "@/shared/components/filters/CategoryFilterFields";
import type { CatalogSelectProps } from "@/shared/types/catalog-select";

export function CategorySelect({
  value,
  onChange,
  placeholder = "Selecciona categoría",
  allowEmpty = false,
  className,
}: CatalogSelectProps) {
  return (
    <CategoryFilterFields
      multiple={false}
      presentation="popover"
      labelClassName="sr-only"
      label="Categoría"
      value={value}
      onChange={(id) => onChange(id ?? null)}
      emptySelectionLabel={placeholder}
      allowEmptySelection={allowEmpty}
      triggerClassName={className}
    />
  );
}
