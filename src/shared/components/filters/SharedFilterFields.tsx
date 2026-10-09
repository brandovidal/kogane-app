import { UsersRound } from "lucide-react";
import { SHARED_FILTER_OPTIONS } from "@/shared/constants/expense-filters";
import {
  ShortFilterFields,
  type ShortFilterFieldsProps,
} from "./ShortFilterFields";

type Props = Omit<ShortFilterFieldsProps, "options" | "mode" | "allLabel"> & {
  allLabel?: string;
  ownLabel?: string;
};

export function SharedFilterFields({
  allLabel = "Todos",
  ownLabel = "No compartidos",
  icon = UsersRound,
  ...props
}: Props) {
  const sharedOptions = SHARED_FILTER_OPTIONS.map((option) =>
    option.value === "no" ? { ...option, label: ownLabel } : option,
  );
  return (
    <ShortFilterFields
      {...props}
      icon={icon}
      options={sharedOptions}
      mode="single"
      allLabel={allLabel}
    />
  );
}
