import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SetStateAction,
} from "react";
import { URL_STATE_CHANGE_EVENT } from "@/shared/constants/url-state";
import {
  readUrlValues,
  replaceUrlValues,
  sameUrlValues,
} from "@/shared/lib/url-state";

// Filters kept in the query string (?q=…&category=…), so a reload or a shared link keeps them (D79)
export function useUrlFilters<T extends object>(
  keys: readonly (keyof T & string)[],
  defaults: T = {} as T,
) {
  const [filters, setFilters] = useState<T>(defaults);
  const current = useRef(filters);
  const configuration = useRef({ keys, defaults });

  useEffect(() => {
    const { keys, defaults } = configuration.current;
    const restore = () => {
      const next = readUrlValues(keys, defaults);
      if (sameUrlValues(current.current, next)) return;
      current.current = next;
      setFilters(next);
    };
    restore();
    window.addEventListener("popstate", restore);
    window.addEventListener(URL_STATE_CHANGE_EVENT, restore);
    // Explicit defaults also travel in shared links (e.g. the initial month/year of cobros).
    replaceUrlValues(keys, current.current, defaults);
    return () => {
      window.removeEventListener("popstate", restore);
      window.removeEventListener(URL_STATE_CHANGE_EVENT, restore);
    };
  }, []);

  const update = useCallback((value: SetStateAction<T>) => {
    const next = typeof value === "function" ? value(current.current) : value;
    current.current = next;
    setFilters(next);
    const { keys, defaults } = configuration.current;
    replaceUrlValues(keys, next, defaults);
  }, []);

  return [filters, update] as const;
}
