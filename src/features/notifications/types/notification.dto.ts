import type { Schemas } from '@/shared/api/client'
import type { paths } from '@/shared/api/schema'

export type NotificationHistoryQuery = NonNullable<paths['/v1/notifications']['get']['parameters']['query']>
export type CollectNowDto = Schemas['CollectNowDto']
export type RemindDebtsDto = Schemas['RemindDebtsDto']
export type UpdateNotificationSettingsDto = Schemas['UpdateNotificationSettingsDto']
