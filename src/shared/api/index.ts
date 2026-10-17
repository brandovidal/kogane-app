// Public module API. Internal files import concrete modules to avoid cycles.
export { apiFetch, api, ApiError, unwrap } from './client'
export type { Schemas } from './client'
export { withQuery } from './query'
export type {
  PaymentMethod,
  Category,
  BudgetGroup,
  DailyExpense,
  FixedCost,
  Subscription,
  CreditCardExpense,
  RecurringExpense,
  Summary,
  Debt,
  DebtDetail,
  ExpenseResource,
  ExpenseByResource,
  AppNotification,
  NotificationKind,
  CalendarEvent,
  Statement,
  StatementRow,
  StatementSummary,
  ImportBatch,
  ImportDetail,
  ImportRow,
  ImportTab,
  ImportRowStatus,
  Commitment,
  CommitmentInstallment,
  Contribution,
  Attachment,
  AttachmentRefType,
  HistoryPage,
  HistoryEntry,
} from './types'
export { EXPENSE_RESOURCES } from './types'
export { useApiMutation, errorMessage } from './hooks/use-api-mutation'
export {
  catalogKeys,
  usePeople,
  usePaymentMethods,
  useCategories,
  useBudgetGroups,
  useCreditCards,
  nameById,
  useMe,
  useCardHolders,
  useSavePerson,
  useSavePaymentMethod,
  useSaveCategory,
  useDeleteCategory,
  useSaveBudgetGroup,
  useDeleteBudgetGroup,
  useSaveCardHolders,
} from './hooks/catalogs'
export type { paths, components, operations } from './schema'
