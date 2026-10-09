import { CalendarClock } from "lucide-react";
import { SUBSCRIPTION_PERIOD_LABELS } from "../constants/subscriptions";
import { entriesOf } from "@/shared/utils/entries";
import {
  ShortFilterFields,
  type ShortFilterFieldsProps,
} from "@/shared/components/filters/ShortFilterFields";

type Props = Omit<
  ShortFilterFieldsProps,
  "options" | "mode" | "allLabel" | "icon"
> & {
  allLabel?: string;
  icon?: ShortFilterFieldsProps["icon"];
  showIcon?: boolean;
};

export function BillingPeriodFilterFields({
  label = "Período de cobro",
  allLabel = "Todos los períodos",
  icon,
  showIcon = true,
  ...props
}: Props) {
  const options = entriesOf(SUBSCRIPTION_PERIOD_LABELS).map((option) => ({
    ...option,
    color:
      option.value === "biweekly"
        ? "#c084fc"
        : option.value === "monthly"
          ? "#a5b4fc"
          : option.value === "quarterly"
            ? "#2dd4bf"
            : option.value === "semiannual"
              ? "#4ade80"
              : "#fbbf24",
  }));
  return (
    <ShortFilterFields
      {...props}
      label={label}
      icon={showIcon ? (icon ?? CalendarClock) : undefined}
      options={options}
      mode="multi"
      allLabel={allLabel}
    />
  );
}
