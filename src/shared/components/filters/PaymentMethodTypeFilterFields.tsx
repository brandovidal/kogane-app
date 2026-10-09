import { PAYMENT_METHOD_ICONS } from "@/shared/constants/payment-methods";
import {
  PAYMENT_METHOD_TYPE_ORDER,
  PAYMENT_METHOD_TYPE_LABELS,
} from "@/shared/constants/payment-methods";
import {
  ShortFilterFields,
  type ShortFilterFieldsProps,
} from "./ShortFilterFields";

type Props = Omit<ShortFilterFieldsProps, "options" | "mode" | "allLabel"> & {
  allLabel?: string;
};

const options = PAYMENT_METHOD_TYPE_ORDER.map((value) => {
  const Icon = PAYMENT_METHOD_ICONS[value];
  return {
    value,
    label: PAYMENT_METHOD_TYPE_LABELS[value],
    decoration: (
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
        <Icon className="size-3.5" />
      </span>
    ),
  };
});

export function PaymentMethodTypeFilterFields({
  allLabel = "Todos los medios",
  ...props
}: Props) {
  return (
    <ShortFilterFields
      {...props}
      options={options}
      mode="multi"
      allLabel={allLabel}
    />
  );
}
