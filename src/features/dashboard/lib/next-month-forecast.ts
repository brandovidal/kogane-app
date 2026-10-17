import type { CreditCardExpense, Debt, FixedCost, Summary } from '@/shared/api/types'
import { DASHBOARD_CLOSED_EXPENSE_STATUSES } from '../constants/dashboard'

const isOpen = (status: string) => !(DASHBOARD_CLOSED_EXPENSE_STATUSES as readonly string[]).includes(status)

export function nextMonthForecast({
  summary,
  fixedCosts,
  cardExpenses,
  debts,
  month,
  year,
}: {
  summary: Summary | undefined
  fixedCosts: FixedCost[]
  cardExpenses: CreditCardExpense[]
  debts: Debt[]
  month: number
  year: number
}) {
  const cards = cardExpenses
    .filter((expense) => isOpen(expense.paymentStatus))
    .reduce((sum, expense) => sum + (expense.amountInPen ?? expense.amount), 0)
  const fixed = fixedCosts
    .filter((expense) => isOpen(expense.paymentStatus))
    .reduce((sum, expense) => sum + (expense.amountInPen ?? expense.amount), 0)
  const loans = debts
    .filter(
      (debt) =>
        debt.paymentYear === year &&
        debt.paymentMonth === month &&
        debt.direction === 'i_owe' &&
        debt.status !== 'paid' &&
        debt.status !== 'cashback',
    )
    .reduce((sum, debt) => sum + debt.balance, 0)
  const income = (summary?.budget?.salary ?? 0) + (summary?.extraIncome ?? 0)
  const committed = cards + fixed + loans
  const firstDue =
    fixedCosts
      .filter((expense) => isOpen(expense.paymentStatus) && expense.dueDate)
      .map((expense) => ({
        title: expense.description,
        date: expense.dueDate!,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null

  return {
    cards,
    fixed,
    loans,
    income,
    committed,
    available: income - committed,
    commitmentPercent: income > 0 ? Math.round((committed / income) * 100) : null,
    firstDue,
  }
}
