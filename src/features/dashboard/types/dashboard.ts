export type DashboardPaymentTab = 'card' | 'fixed' | 'collect' | 'debt'

export interface CreditCardSummary {
  code: string
  name: string
  color: string | null
  total: number
  billingCloseDay: number
  paymentDueDay: number
}
