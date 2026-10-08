// Public module API. Internal files import concrete modules to avoid cycles.
export { BudgetDonut } from "./components/BudgetDonut";
export { BudgetCategoryDetail } from "./components/BudgetCategoryDetail";
export { BudgetKpiCard } from "./components/BudgetKpiCard";
export { BudgetGroupsCard } from "./components/BudgetGroupsCard";
export { BudgetKpis } from "./components/BudgetKpis";
export { BudgetVsActual } from "./components/BudgetVsActual";
export { SurplusTrend } from "./components/SurplusTrend";
export { SalaryDialog } from "./components/dialogs/SalaryDialog";
export type { SalaryDialogProps } from "./components/dialogs/SalaryDialog";
export { useMonthlySalary } from "./hooks/useMonthlySalary";
export {
  SalaryAmountSection,
  type SalaryAmountSectionProps,
} from "./sections/SalaryAmountSection";
export {
  monthlySalarySchema,
  salaryPeriodFromUrl,
  type SalaryPeriod,
} from "./lib/monthly-salary";
export {
  summaryKeys,
  useSummary,
  useSetBudget,
  useSummaryHistory,
  useBudgetSettings,
  useSaveBudgetSettings,
} from "./hooks/summary";
export type { DonutMode, DonutSlice, LimitStatus } from "./lib/budget-view";
export {
  donutSlices,
  STATUS_BAR,
  STATUS_TEXT,
  incomeOf,
  limitUsage,
} from "./lib/budget-view";
