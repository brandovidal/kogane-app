import { createStore } from 'zustand/vanilla'

const STORAGE_KEY = 'kogane:settings-nav'

export interface SettingsNavigationState {
  rail: boolean
  folded: string[]
}

interface SettingsNavigationStore extends SettingsNavigationState {
  hydrate: () => void
  update: (state: SettingsNavigationState) => void
}

const initialState: SettingsNavigationState = { rail: false, folded: [] }

export const settingsNavigationStore = createStore<SettingsNavigationStore>()((set) => ({
  ...initialState,
  hydrate: () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<SettingsNavigationState>
      set({
        rail: Boolean(parsed.rail),
        folded: Array.isArray(parsed.folded) ? parsed.folded.filter((item): item is string => typeof item === 'string') : [],
      })
    } catch {
      set(initialState)
    }
  },
  update: (state) => {
    set(state)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // The navigation remains usable without persistence.
    }
  },
}))
