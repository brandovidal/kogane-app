import type { ReactNode } from 'react'
import type { DataTableCalculation, DataTableCalculationState } from './data-table-calculation'

export type ViewMode = 'table' | 'cards'

export interface Column<T> {
  key: string
  header: string
  cell: (item: T) => ReactNode
  cardCell?: (item: T) => ReactNode
  role?: 'title' | 'amount' | 'actions' | 'meta'
  className?: string
  calculationType?: 'number' | 'text' | false
  formatCalculation?: (value: number) => string
  accessor?: (item: T) => string | number | null | undefined
  hideable?: boolean
}

export interface DataViewProps<T> {
  items: T[]
  columns: Column<T>[]
  rowKey: (item: T) => string
  view: ViewMode
  footer?: ReactNode
  summary?: DataViewSummary
  calculationStorageKey?: string
  calculationDefaults?: Record<string, DataTableCalculation>
  calculationState?: DataTableCalculationState
  tableClassName?: string
  rowClassName?: (row: T) => string | undefined
  extraCard?: ReactNode
  compactCards?: boolean
  cardRenderer?: (item: T) => ReactNode
  selected?: Set<string>
  onSelectedChange?: (selected: Set<string>) => void
  selectionDisabled?: boolean
}

export interface DataViewSummary {
  label?: ReactNode
}
