// Public module API. Internal files import concrete modules to avoid cycles.
export type { CreditCardSummary } from "./dashboard.service";
export { buildCreditCardSummaries } from "./dashboard.service";
