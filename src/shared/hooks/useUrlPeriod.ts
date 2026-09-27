import { useEffect } from "react";
import {
  URL_PERIOD_KEYS,
  URL_STATE_CHANGE_EVENT,
} from "@/shared/constants/url-state";
import { replaceUrlValues } from "@/shared/lib/url-state";
import { periodStore } from "@/shared/stores/period.store";

// Opt-in for pages whose month navigator controls their API query. Debt filters own their own period keys.
export function useUrlPeriod({
  minYear = 1,
  maxYear = 9999,
}: { minYear?: number; maxYear?: number } = {}) {
  useEffect(() => {
    const initial = periodStore.getState();
    const write = () => {
      const { month, year } = periodStore.getState();
      replaceUrlValues(URL_PERIOD_KEYS, {
        month: String(month),
        year: String(year),
      });
    };
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      const monthValue = params.get("month") ?? "";
      const yearValue = params.get("year") ?? "";
      const parsedMonth = /^\d{1,2}$/.test(monthValue) ? Number(monthValue) : 0;
      const parsedYear = /^\d{1,4}$/.test(yearValue) ? Number(yearValue) : 0;
      const month =
        parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : initial.month;
      const year =
        parsedYear >= minYear && parsedYear <= maxYear
          ? parsedYear
          : initial.year;
      const current = periodStore.getState();
      if (current.month !== month || current.year !== year)
        current.setPeriod(month, year);
    };
    restore();
    const unsubscribe = periodStore.subscribe(write);
    window.addEventListener("popstate", restore);
    window.addEventListener(URL_STATE_CHANGE_EVENT, restore);
    write();
    return () => {
      unsubscribe();
      window.removeEventListener("popstate", restore);
      window.removeEventListener(URL_STATE_CHANGE_EVENT, restore);
    };
  }, [minYear, maxYear]);
}
