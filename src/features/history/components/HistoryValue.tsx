import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { PAYMENT_STATUS_LABELS } from "@/shared/constants/finance";

interface HistoryValueProps {
  field: string;
  rawValue: unknown;
  formattedValue: string;
}

export function HistoryValue({
  field,
  rawValue,
  formattedValue,
}: HistoryValueProps) {
  if (
    (field === "paymentStatus" || field === "status") &&
    typeof rawValue === "string" &&
    PAYMENT_STATUS_LABELS[rawValue]
  ) {
    return <StatusBadge status={rawValue} />;
  }

  return (
    <span className="whitespace-pre-wrap wrap-anywhere">{formattedValue}</span>
  );
}
