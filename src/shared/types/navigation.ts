export type NavIcon =
  | 'message-circle'
  | 'scan-text'
  | 'inbox'
  | 'layout-dashboard'
  | 'plus-circle'
  | 'receipt'
  | 'coffee'
  | 'tv'
  | 'credit-card'
  | 'repeat'
  | 'hand-coins'
  | 'pie-chart'
  | 'tags'
  | 'bar-chart-3'
  | 'settings'
  | 'wallet'
  | 'calendar'
  | 'file-text'
  | 'landmark'

export interface NavLink {
  href: string
  label: string
  description?: string
  icon: NavIcon
  badge?: 'drafts'
  cards?: boolean
  action?: 'new-expense'
}

export interface NavGroup {
  label: string
  description?: string
  icon: NavIcon
  children: NavLink[]
}

export type NavEntry = NavLink | NavGroup

export interface Card {
  href: string
  label: string
}

export interface FlatLink {
  href: string
  label: string
  group?: string
  action?: NavLink['action']
}
