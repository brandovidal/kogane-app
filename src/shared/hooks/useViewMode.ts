import { useEffect, useState } from "react";
import type { ViewMode } from "@/shared/types/data-view";
import { VIEW_STORAGE_PREFIX } from "@/shared/constants/view";

// The view of each page, remembered in this browser (a convenience: without storage it uses the default)
export function useViewMode(
  page: string,
  initial: ViewMode,
): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(initial);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_STORAGE_PREFIX + page);
      if (stored === "table" || stored === "cards") setMode(stored);
    } catch {
      // keep the default
    }
  }, [page]);
  const update = (next: ViewMode) => {
    setMode(next);
    try {
      localStorage.setItem(VIEW_STORAGE_PREFIX + page, next);
    } catch {
      // not remembered
    }
  };
  return [mode, update];
}
