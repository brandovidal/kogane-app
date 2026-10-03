import { useCallback, useEffect, type SetStateAction } from "react";
import { URL_GROUP_KEYS } from "@/shared/constants/url-state";
import { useUrlFilters } from "./useUrlFilters";

export function useUrlGrouping<T extends string>(
  allowed: readonly T[],
  fallback: T,
) {
  const [params, setParams] = useUrlFilters<{ group?: string }>(URL_GROUP_KEYS);
  const group = allowed.find((value) => value === params.group) ?? fallback;
  useEffect(() => {
    if (
      params.group &&
      (params.group === fallback ||
        !allowed.some((value) => value === params.group))
    )
      setParams({});
  }, [allowed, fallback, params.group, setParams]);
  const update = useCallback(
    (value: SetStateAction<T>) => {
      setParams((current) => {
        const previous =
          allowed.find((value) => value === current.group) ?? fallback;
        const next = typeof value === "function" ? value(previous) : value;
        return next === fallback ? {} : { group: next };
      });
    },
    [allowed, fallback, setParams],
  );
  return [group, update] as const;
}
