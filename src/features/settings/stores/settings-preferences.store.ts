import { createStore } from 'zustand/vanilla'
import { DEFAULT_SETTINGS_PREFERENCES, SETTINGS_PREFERENCES_STORAGE_KEY, SETTINGS_TIME_ZONES } from '../constants/preferences'
import type { SettingsCurrency, SettingsPreferences, SettingsTimeZone } from '../types/preferences'

interface SettingsPreferencesState extends SettingsPreferences {
  hydrate: () => void
  setCurrency: (currency: SettingsCurrency) => void
  setTimeZone: (timeZone: SettingsTimeZone) => void
}

function persist(preferences: SettingsPreferences) {
  try {
    window.localStorage.setItem(SETTINGS_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

export const settingsPreferencesStore = createStore<SettingsPreferencesState>()((set, get) => ({
  ...DEFAULT_SETTINGS_PREFERENCES,
  hydrate: () => {
    try {
      const stored = window.localStorage.getItem(SETTINGS_PREFERENCES_STORAGE_KEY)
      if (!stored) return
      const parsed = JSON.parse(stored) as Partial<SettingsPreferences>
      const next: SettingsPreferences = {
        currency: parsed.currency === 'USD' ? 'USD' : 'PEN',
        timeZone: SETTINGS_TIME_ZONES.some((zone) => zone.value === parsed.timeZone)
          ? (parsed.timeZone as SettingsTimeZone)
          : DEFAULT_SETTINGS_PREFERENCES.timeZone,
      }
      set(next)
    } catch {
      set(DEFAULT_SETTINGS_PREFERENCES)
    }
  },
  setCurrency: (currency) => {
    const next = { ...get(), currency }
    set({ currency })
    persist(next)
  },
  setTimeZone: (timeZone) => {
    const next = { ...get(), timeZone }
    set({ timeZone })
    persist(next)
  },
}))
