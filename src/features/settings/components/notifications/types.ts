import type { NotificationKind } from '@/shared/api/types'

export interface NotificationGroupItem {
  kind: NotificationKind
  title: string
  description: string
}

export interface NotificationGroup {
  label: string
  items: NotificationGroupItem[]
}
