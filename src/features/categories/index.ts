// Public module API. Internal files import concrete modules to avoid cycles.
export { CategoryDialog } from "./components/CategoryDialog";
export {
  CATEGORY_ICON_OPTIONS,
  normalizeCategoryIconName,
  getCategoryIcon,
  matchesCategoryIcon,
} from "./lib/category-icons";
export { CategoryIcon } from "./components/CategoryIcon";
export { CategoryIconPicker } from "./components/CategoryIconPicker";
export { CategoryLabel } from "./components/CategoryLabel";
export { CategoryManager } from "./components/CategoryManager";
export { CategorySelect } from "./components/CategorySelect";
export type {
  CategoryBudgetLine,
  CategoryBudgetBody,
} from "./hooks/category-budgets";
export {
  useCategoryBudgets,
  useSaveCategoryBudget,
  useDeleteCategoryBudget,
} from "./hooks/category-budgets";
export type { CategoryIconOption } from "./lib/category-icons";
