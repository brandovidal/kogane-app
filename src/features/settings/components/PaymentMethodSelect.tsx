import { usePaymentMethods } from "@/shared/api/hooks/catalogs";
import type { CatalogSelectProps } from "@/shared/types/catalog-select";
import { CatalogSelectOptions } from "@/shared/components/forms/CatalogSelect";
import { PaymentMethodLabel } from "./PaymentMethodLabel";

export function PaymentMethodSelect({ type, ...props }: CatalogSelectProps & { type?: string }) {
  const options = usePaymentMethods().data?.filter((method) => method.isActive && (!type || method.type === type)) ?? [];
  return <CatalogSelectOptions {...props} options={options.map((method) => ({
    id: method.id,
    name: method.name,
    content: <PaymentMethodLabel name={method.name} type={method.type} color={method.color} />,
  }))} />;
}
