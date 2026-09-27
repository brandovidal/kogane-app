import { useCategories } from "@/shared/api/hooks/catalogs";
import type { CatalogSelectProps } from "@/shared/types/catalog-select";
import { CatalogSelectOptions } from "@/shared/components/forms/CatalogSelect";
import { CategoryLabel } from "./CategoryLabel";

export function CategorySelect(props: CatalogSelectProps) {
  const options = (useCategories().data ?? []).map((category) => ({ ...category, content: <CategoryLabel name={category.name} icon={category.icon} color={category.color} /> }));
  return <CatalogSelectOptions {...props} options={options} />;
}
