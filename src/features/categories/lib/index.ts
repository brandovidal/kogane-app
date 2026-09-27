// Public module API. Internal files import concrete modules to avoid cycles.
export type { CategoryIconOption } from "./category-icons";
export { CATEGORY_ICON_OPTIONS, normalizeCategoryIconName, getCategoryIcon, matchesCategoryIcon } from "./category-icons";
