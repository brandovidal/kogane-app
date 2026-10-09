import { PersonFilterFields } from "@/shared/components/filters/PersonFilterFields";
import type { CatalogSelectProps } from "@/shared/types/catalog-select";

export function PersonSelect({
  value,
  onChange,
  placeholder = "Selecciona persona",
  className,
}: CatalogSelectProps) {
  return (
    <PersonFilterFields
      value={value ?? undefined}
      onChange={(id) => onChange(id ?? null)}
      label="Persona"
      labelClassName="sr-only"
      emptySelectionLabel={placeholder}
      includeUnassigned={false}
      multiple={false}
      useMeAlias={false}
      presentation="popover"
      triggerClassName={className}
    />
  );
}
