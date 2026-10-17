import type { CreateAccountDto } from '@/shared/api/services/catalog.service'

export type AccountType = CreateAccountDto['type']

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank_account: 'Cuenta bancaria',
  wallet: 'Billetera',
  cash: 'Efectivo',
}

export interface AccountForm {
  name: string
  type: AccountType
  bank: string
  currency: 'PEN' | 'USD'
  color: string
}

export const emptyAccountForm = (): AccountForm => ({
  name: '',
  type: 'bank_account',
  bank: '',
  currency: 'PEN',
  color: '',
})

// A bank account needs its bank (the API answers 422 otherwise); the rest only needs a name
export function accountErrors(form: AccountForm): Partial<Record<keyof AccountForm, string>> {
  const errors: Partial<Record<keyof AccountForm, string>> = {}
  if (!form.name.trim()) errors.name = 'Ponle un nombre'
  if (form.type === 'bank_account' && !form.bank.trim()) errors.bank = 'Una cuenta bancaria necesita su banco'
  return errors
}

export function accountBody(form: AccountForm): CreateAccountDto {
  return {
    name: form.name.trim(),
    type: form.type,
    bank: form.type === 'bank_account' ? form.bank.trim() : null,
    currency: form.currency,
    color: form.color || null,
  }
}
