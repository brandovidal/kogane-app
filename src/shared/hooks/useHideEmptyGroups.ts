import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "kogane:hide-empty-groups:";

/**
 * "Ocultar grupos vacíos" of the Agrupar menu, remembered per list in this browser (a convenience).
 * On by default: only groups with rows are shown, like before the option existed.
 */
export function useHideEmptyGroups(page: string) {
  const [hide, setHide] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + page);
      if (stored !== null) setHide(stored === "1");
    } catch {
      // keep the default
    }
  }, [page]);

  const update = useCallback(
    (next: boolean) => {
      setHide(next);
      try {
        localStorage.setItem(STORAGE_PREFIX + page, next ? "1" : "0");
      } catch {
        // not remembered
      }
    },
    [page],
  );

  return [hide, update] as const;
}
