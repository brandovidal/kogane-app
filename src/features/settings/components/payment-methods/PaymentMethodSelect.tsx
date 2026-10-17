import { PaymentMethodFilterFields } from "@/shared/components/filters/PaymentMethodFilterFields";
import type { CatalogSelectProps } from "@/shared/types/catalog-select";

export function PaymentMethodSelect({
  type,
  groupByType: _groupByType,
  value,
  onChange,
  placeholder = "Selecciona medio de pago",
  allowEmpty = false,
  className,
}: CatalogSelectProps & { type?: string; groupByType?: boolean }) {
  return (
    <PaymentMethodFilterFields
      value={value ?? undefined}
      onChange={(id) => onChange(id ?? null)}
      label="Medio de pago"
      labelClassName="sr-only"
      emptySelectionLabel={placeholder}
      allowEmptySelection={allowEmpty}
      multiple={false}
      presentation="popover"
      type={type}
      triggerClassName={className}
    />
  );
}
