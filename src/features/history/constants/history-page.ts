import { ACTION_LABELS, ENTITY_LABELS, SOURCE_LABELS } from '../lib/history-view'
import type { HistoryActionFilter } from '../types/history-page'

export const HISTORY_ALL = '__all__'

export const HISTORY_ACTION_FILTERS: { id: HistoryActionFilter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'create', label: ACTION_LABELS.create },
  { id: 'update', label: ACTION_LABELS.update },
  { id: 'delete', label: ACTION_LABELS.delete },
]

export const HISTORY_TABLES = Object.entries(ENTITY_LABELS).map(([value, label]) => ({ value, label }))

export const HISTORY_SOURCES = [
  { value: 'web', label: SOURCE_LABELS.web },
  { value: 'bot', label: SOURCE_LABELS.bot },
  { value: 'import', label: SOURCE_LABELS.import },
  { value: 'scheduler', label: 'Programado' },
  { value: 'cli', label: SOURCE_LABELS.cli },
]

export const HISTORY_MODULES = [
  {
    key: 'expenses',
    label: 'Gastos',
    entities: ['exp_daily_expenses', 'exp_fixed_costs', 'exp_subscriptions', 'exp_credit_card_expenses', 'exp_recurring_expenses'],
  },
  { key: 'debts', label: 'Cobros y deudas', entities: ['exp_debts', 'exp_debt_payments'] },
  { key: 'commitments', label: 'Préstamos e inversiones', entities: ['exp_commitments', 'exp_contributions'] },
  {
    key: 'budget',
    label: 'Presupuesto',
    entities: ['bud_monthly_budgets', 'bud_budget_groups', 'bud_category_budgets', 'bud_incomes', 'bud_settings'],
  },
  { key: 'settings', label: 'Configuración', entities: ['cat_people', 'cat_payment_methods', 'cat_card_holders', 'cat_categories', 'ntf_settings'] },
  { key: 'imports', label: 'Importación', entities: ['imp_batches', 'imp_statements'] },
] as const
