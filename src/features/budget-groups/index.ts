// Public module API. Internal files import concrete modules to avoid cycles.
export { BudgetGroupDialog } from "./components/BudgetGroupDialog";
export { useBudgetGroupSummaries } from "./hooks/useBudgetGroupSummaries";
export type { BudgetGroupSummary } from "./services/budget-group.service";
export { buildBudgetGroupSummaries } from "./services/budget-group.service";
