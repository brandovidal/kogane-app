import { usePeople } from "@/shared/api/hooks/catalogs";
import type { CatalogSelectProps } from "@/shared/types/catalog-select";
import { CatalogSelectOptions } from "@/shared/components/forms/CatalogSelect";

export function PersonSelect(props: CatalogSelectProps) {
  const options = usePeople().data?.filter((person) => person.isActive) ?? [];
  return <CatalogSelectOptions placeholder="Selecciona persona" {...props} options={options} />;
}
