import { useState } from 'react'
import type { PaymentMethod } from '@/shared/api/types'
import { PAYMENT_METHOD_COLORS } from '../constants/payment-method-form'
import type { MethodType, PaymentMethodFormState } from '../types/payment-method-form'

const fromMethod = (method?: PaymentMethod, defaultType: MethodType = 'credit_card'): PaymentMethodFormState => ({
  name: method?.name ?? '',
  type: method?.type ?? defaultType,
  code: method?.code ?? '',
  bank: method?.bank ?? '',
  network: method?.network ?? '',
  currency: method?.currency ?? 'PEN',
  creditLimit: method?.creditLimit == null ? '' : String(method.creditLimit),
  billingCloseDay: method?.billingCloseDay == null ? '' : String(method.billingCloseDay),
  paymentDueDay: method?.paymentDueDay == null ? '' : String(method.paymentDueDay),
  color: method?.color ?? PAYMENT_METHOD_COLORS[2],
  isActive: method?.isActive ?? true,
  showInBot: method?.showInBot ?? true,
  supportsAmortization: method?.supportsAmortization ?? false,
  supportsCashback: method?.supportsCashback ?? false,
})

const validDay = (value: string) => /^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 31

export function usePaymentMethodForm(method?: PaymentMethod, defaultType: MethodType = 'credit_card') {
  const [form, setForm] = useState(() => fromMethod(method, defaultType))
  const set = (change: Partial<PaymentMethodFormState>) => setForm((previous) => ({ ...previous, ...change }))

  return { form, setForm, set, fromMethod, validDay }
}
