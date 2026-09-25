import { useCallback, useEffect, useState } from "react";

// Filters kept in the query string (?q=…&category=…), so a reload or a shared link keeps them (D79)
export function useUrlFilters<T extends object>(keys: (keyof T & string)[], defaults: T = {} as T) {
  const [filters, setFilters] = useState<T>(defaults);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = { ...defaults } as T;
    for (const key of keys) {
      const value = params.get(key);
      if (value) (initial as Record<string, string>)[key] = value;
    }
    setFilters(initial);
    // read once, on load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    (next: T) => {
      setFilters(next);
      const params = new URLSearchParams(window.location.search);
      for (const key of keys) {
        const value = next[key] as string | undefined;
        if (value) params.set(key, value);
        else params.delete(key);
      }
      const query = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    },
    [keys],
  );

  return [filters, update] as const;
}
