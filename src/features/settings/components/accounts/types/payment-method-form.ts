import type { PaymentMethod } from '@/shared/api/types'

export type MethodType = PaymentMethod['type']

export interface PaymentMethodFormState {
  name: string
  type: MethodType
  code: string
  bank: string
  network: string
  currency: 'PEN' | 'USD'
  creditLimit: string
  billingCloseDay: string
  paymentDueDay: string
  color: string
  isActive: boolean
  showInBot: boolean
  supportsAmortization: boolean
  supportsCashback: boolean
}

export interface NewCardDialogProps {
  onClose: () => void
  method?: PaymentMethod
  defaultType?: MethodType
  catalogCards?: PaymentMethod[]
}
