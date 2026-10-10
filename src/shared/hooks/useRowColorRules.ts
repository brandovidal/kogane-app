import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_ROW_COLOR_RULES,
  parseRowColorRules,
  rowColorClass,
  type RowColorRule,
  type RowColorSubject,
} from "@/shared/lib/row-color-rules";
import { localTodayKey } from "@/shared/lib/dates";

const STORAGE_PREFIX = "kogane:row-colors:";

/**
 * Conditional row colors of a list, remembered in this browser (a convenience: without storage the
 * defaults apply). `today` is read after mount so the server and the first client render agree.
 */
export function useRowColorRules(page: string) {
  const [rules, setRules] = useState<RowColorRule[]>(DEFAULT_ROW_COLOR_RULES);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(localTodayKey());
    try {
      const stored = parseRowColorRules(
        localStorage.getItem(STORAGE_PREFIX + page),
      );
      if (stored) setRules(stored);
    } catch {
      // keep the defaults
    }
  }, [page]);

  const update = useCallback(
    (next: RowColorRule[]) => {
      setRules(next);
      try {
        localStorage.setItem(STORAGE_PREFIX + page, JSON.stringify(next));
      } catch {
        // not remembered
      }
    },
    [page],
  );

  const reset = useCallback(() => {
    setRules(DEFAULT_ROW_COLOR_RULES);
    try {
      localStorage.removeItem(STORAGE_PREFIX + page);
    } catch {
      // nothing to forget
    }
  }, [page]);

  const rowClassName = useMemo(
    () =>
      today
        ? (subject: RowColorSubject) => rowColorClass(rules, subject, today)
        : () => undefined,
    [rules, today],
  );

  return { rules, setRules: update, reset, rowClassName };
}
