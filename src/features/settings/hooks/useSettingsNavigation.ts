import { useEffect } from "react";
import { useStore } from "zustand";
import { settingsNavigationStore } from "../stores/settings-navigation.store";

export function useSettingsNavigation() {
  const rail = useStore(settingsNavigationStore, (state) => state.rail);
  const folded = useStore(settingsNavigationStore, (state) => state.folded);
  const update = settingsNavigationStore.getState().update;
  useEffect(() => settingsNavigationStore.getState().hydrate(), []);
  return { rail, folded, update };
}
