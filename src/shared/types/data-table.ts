import type { ReactNode } from 'react'
import type {
  ColumnDef,
  OnChangeFn,
  RowSelectionState,
  VisibilityState,
  ColumnFiltersState,
  PaginationState,
  RowData,
  SortingState,
  Table,
} from '@tanstack/react-table'
import type { DataTableCalculationState } from './data-table-calculation'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string
    className?: string
    calculationType?: 'number' | 'text' | false
    formatCalculation?: (value: number) => string
  }
}

interface DataTableQuery {
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  search: string
}

export interface DataTableBasicProps<T> {
  table: Table<T>
  className?: string
  loading?: boolean
  error?: ReactNode
  emptyMessage?: ReactNode
  footer?: ReactNode
  calculationStorageKey?: string
  calculationDefaults?: Record<string, import('./data-table-calculation').DataTableCalculation>
  calculationState?: DataTableCalculationState
  rowClassName?: (row: T) => string | undefined
  rowIsSelected?: (row: T) => boolean
}

export interface DataTableComplexProps<T> extends DataTableBasicProps<T> {
  toolbar?: ReactNode
  pagination?: boolean
}

interface DataTableOptions<T> {
  items: T[]
  columns: ColumnDef<T>[]
  rowKey: (item: T) => string
  selectable?: boolean
  selectionDisabled?: boolean
  paginationEnabled?: boolean
  resetKey?: string
  state?: Partial<DataTableQuery> & {
    rowSelection?: RowSelectionState
    columnVisibility?: VisibilityState
  }
  onPaginationChange?: OnChangeFn<PaginationState>
  onSortingChange?: OnChangeFn<SortingState>
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  onSearchChange?: OnChangeFn<string>
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  onQueryChange?: (query: DataTableQuery) => void
}

export type UseDataTableOptions<T> = DataTableOptions<T> & ({ mode?: 'client'; rowCount?: never } | { mode: 'server'; rowCount: number })
