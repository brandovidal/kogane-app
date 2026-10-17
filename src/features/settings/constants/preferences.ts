import type { SettingsTimeZone } from '../types/preferences'

export const SETTINGS_PREFERENCES_STORAGE_KEY = 'kogane:settings:preferences'
export const DEFAULT_SETTINGS_PREFERENCES = { currency: 'PEN', timeZone: 'America/Lima' } as const

export const SETTINGS_TIME_ZONES: { value: SettingsTimeZone; label: string }[] = [
  { value: 'America/Lima', label: 'America/Lima (UTC−05:00)' },
  { value: 'America/Bogota', label: 'America/Bogota (UTC−05:00)' },
  { value: 'America/Santiago', label: 'America/Santiago' },
  { value: 'America/Mexico_City', label: 'America/Mexico_City' },
  { value: 'UTC', label: 'UTC' },
]
