import type { LucideIcon } from "lucide-react";

import { usePaymentMethods } from "@/shared/api/hooks/catalogs";
import type { PaymentMethod } from "@/shared/api/types";
import { PaymentMethodIcon } from "@/shared/components/data-display/PaymentMethodIcon";
import { MultiSelect } from "@/shared/components/filters/MultiSelect";
import {
  PAYMENT_METHOD_TYPE_LABELS,
  PAYMENT_METHOD_TYPE_ORDER,
} from "@/shared/constants/payment-methods";

export interface PaymentMethodFilterFieldsProps {
  value?: string | null;
  onChange: (value: string | undefined) => void;
  label?: string;
  allLabel?: string;
  activeMarker?: boolean;
  icon?: LucideIcon;
  width?: string;
  labelClassName?: string;
  presentation?: "popover" | "inline" | "responsive-sheet";
  primaryMethodId?: string;
  counts?: Record<string, number>;
  multiple?: boolean;
  emptySelectionLabel?: string;
  allowEmptySelection?: boolean;
  type?: string;
  triggerClassName?: string;
}

export function PaymentMethodFilterFields({
  value,
  onChange,
  label = "Medio de pago",
  allLabel = "Todos los medios de pago",
  activeMarker = false,
  icon,
  width = "w-full",
  labelClassName = "text-sm font-medium",
  presentation = "responsive-sheet",
  primaryMethodId,
  counts,
  multiple = true,
  emptySelectionLabel = "Ninguna cuenta",
  allowEmptySelection = false,
  type,
  triggerClassName,
}: PaymentMethodFilterFieldsProps) {
  const methods = usePaymentMethods().data ?? [];
  const selected = value?.split(",").filter(Boolean) ?? [];
  const activeMethods = methods
    .filter((method) => method.isActive && (!type || method.type === type))
    .sort(
      (left, right) =>
        PAYMENT_METHOD_TYPE_ORDER.indexOf(left.type) -
          PAYMENT_METHOD_TYPE_ORDER.indexOf(right.type) ||
        left.name.localeCompare(right.name, "es"),
    );
  const options = activeMethods.map((method) => {
    const withPrimary = method as PaymentMethod & { isPrimary?: boolean };
    return {
      value: method.id,
      label: method.name,
      group: PAYMENT_METHOD_TYPE_LABELS[method.type],
      groupDecoration: (
        <PaymentMethodIcon
          type={method.type}
          className="size-4 rounded-sm bg-muted text-muted-foreground [&>svg]:size-2.5"
        />
      ),
      decoration: <PaymentMethodIcon type={method.type} color={method.color} />,
      searchTerms: [method.code ?? "", method.bank ?? "", method.network ?? ""],
      searchAliases: method.aliases,
      badge:
        method.id === primaryMethodId || withPrimary.isPrimary
          ? "Principal"
          : undefined,
      count: counts?.[method.id],
    };
  });
  const allCount =
    counts &&
    activeMethods.reduce(
      (total, method) => total + (counts[method.id] ?? 0),
      0,
    );

  return (
    <MultiSelect
      label={label}
      value={selected}
      options={options}
      onChange={(next) => onChange(next?.join(",") || undefined)}
      width={width}
      allLabel={allLabel}
      allCount={allCount}
      emptySelectionLabel={emptySelectionLabel}
      activeMarker={activeMarker}
      icon={icon}
      labelClassName={labelClassName}
      emptyDescription={(query) => (
        <>
          Ninguna cuenta coincide con «{query}».
          <br />
          Las cuentas activas salen de los medios de pago configurados.
        </>
      )}
      emptyValueMeansAll={multiple}
      multiple={multiple}
      allowEmptySelection={allowEmptySelection}
      showSelectionFooter={multiple}
      triggerClassName={triggerClassName}
      summaryMode="payment-method"
      presentation={presentation}
      hierarchicalGroups
      circularSelectionMarks
      listClassName="max-h-[min(70vh,38rem)]"
    />
  );
}
