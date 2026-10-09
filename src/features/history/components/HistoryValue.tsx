import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { PAYMENT_STATUS_LABELS } from "@/shared/constants/finance";
import { HistoryExpandableText } from "./HistoryExpandableText";

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

  return <HistoryExpandableText text={formattedValue} />;
}
