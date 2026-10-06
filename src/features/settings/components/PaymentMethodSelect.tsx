import { usePaymentMethods } from "@/shared/api/hooks/catalogs";
import type { CatalogSelectProps } from "@/shared/types/catalog-select";
import { CatalogSelectOptions } from "@/shared/components/forms/CatalogSelect";
import { PaymentMethodLabel } from "./PaymentMethodLabel";
import { PAYMENT_METHOD_TYPE_LABELS } from "../constants/payment-methods";

const PAYMENT_METHOD_GROUP_ORDER = ["cash", "credit_card", "debit_card", "wallet", "bank_transfer"];

export function PaymentMethodSelect({ type, groupByType = false, ...props }: CatalogSelectProps & { type?: string; groupByType?: boolean }) {
  const methods = usePaymentMethods().data?.filter((method) => method.isActive && (!type || method.type === type)) ?? [];
  const options = groupByType
    ? [...methods].sort((a, b) => PAYMENT_METHOD_GROUP_ORDER.indexOf(a.type) - PAYMENT_METHOD_GROUP_ORDER.indexOf(b.type))
    : methods;
  return <CatalogSelectOptions {...props} options={options.map((method) => ({
    id: method.id,
    name: method.name,
    group: groupByType ? PAYMENT_METHOD_TYPE_LABELS[method.type] : undefined,
    content: <PaymentMethodLabel name={method.name} type={method.type} color={method.color} />,
  }))} />;
}
