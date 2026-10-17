// Public module API. Internal files import concrete modules to avoid cycles.
export type { CreditCardSummary } from '../types/dashboard'
export { buildCreditCardSummaries } from './dashboard.service'
