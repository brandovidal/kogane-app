import { useEffect } from 'react'
import { useStore } from 'zustand'
import { settingsPreferencesStore } from '../stores/settings-preferences.store'

export function useSettingsPreferences() {
  const currency = useStore(settingsPreferencesStore, (state) => state.currency)
  const timeZone = useStore(settingsPreferencesStore, (state) => state.timeZone)
  const { setCurrency, setTimeZone } = settingsPreferencesStore.getState()
  useEffect(() => settingsPreferencesStore.getState().hydrate(), [])
  return { currency, timeZone, setCurrency, setTimeZone }
}
