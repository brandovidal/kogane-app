import { useMemo } from "react";

/** Stable indices for rendering repeated loading placeholders. */
export function useSkeletonItems(count: number) {
  return useMemo(
    () => Array.from({ length: count }, (_, index) => index),
    [count],
  );
}
