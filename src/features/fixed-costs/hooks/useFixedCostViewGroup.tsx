import type { FixedCost } from "@/shared/api/types";
import { localTodayKey } from "@/shared/lib/dates";
import {
  URGENCY_GROUPS,
  monthGroupKey,
  monthGroupLabel,
  urgencyDotColor,
  urgencyOf,
} from "../lib/fixed-cost-views";
import type { FixedCostView } from "../lib/fixed-cost-views";

export function useFixedCostViewGroup(page: FixedCostView) {
  if (page === "por-pagar") {
    return {
      field: "urgency",
      key: (cost: FixedCost) => urgencyOf(cost, localTodayKey()),
      label: (key: string) => {
        const group = URGENCY_GROUPS.find((item) => item.value === key);
        return (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${urgencyDotColor(key)}`}
            />
            {group?.label ?? key}
          </span>
        );
      },
    };
  }

  if (page === "todos") {
    return {
      field: "month",
      key: monthGroupKey,
      label: monthGroupLabel,
    };
  }

  return undefined;
}
