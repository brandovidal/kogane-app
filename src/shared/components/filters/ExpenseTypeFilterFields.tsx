import { ListFilter } from "lucide-react";
import { EXPENSE_TYPE_LABELS } from "@/shared/constants/finance";
import {
  ShortFilterFields,
  type ShortFilterFieldsProps,
} from "./ShortFilterFields";

type Props = Omit<ShortFilterFieldsProps, "options" | "mode" | "allLabel"> & {
  allLabel?: string;
};

const options = Object.entries(EXPENSE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
  color: value === "essential" ? "#34d399" : "#fbbf24",
}));

export function ExpenseTypeFilterFields({
  allLabel = "Todos los tipos",
  icon = ListFilter,
  ...props
}: Props) {
  return (
    <ShortFilterFields
      {...props}
      icon={icon}
      options={options}
      mode="multi"
      allLabel={allLabel}
    />
  );
}
