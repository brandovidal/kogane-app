import { Coins } from "lucide-react";
import { CURRENCY_OPTIONS } from "@/shared/constants/currency";
import {
  ShortFilterFields,
  type ShortFilterFieldsProps,
} from "./ShortFilterFields";

type Props = Omit<ShortFilterFieldsProps, "options" | "mode" | "allLabel"> & {
  allLabel?: string;
};

const options = CURRENCY_OPTIONS.map((option) => ({
  ...option,
  decoration: (
    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
      {option.value === "PEN" ? "S/" : "$"}
    </span>
  ),
}));

export function CurrencyFilterFields({
  allLabel = "Todas las monedas",
  icon = Coins,
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
