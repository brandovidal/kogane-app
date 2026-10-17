import { PAYMENT_STATUS_GROUPS } from "@/shared/constants/finance";

export function groupPaymentStatuses(options: readonly string[]) {
  const groups: { label: string; options: string[] }[] = PAYMENT_STATUS_GROUPS.map((group) => ({
    label: group.label,
    options: group.statuses.filter((status) => options.includes(status)),
  })).filter((group) => group.options.length > 0);

  const knownStatuses = new Set(groups.flatMap((group) => group.options));
  const others = options.filter((status) => !knownStatuses.has(status));
  if (others.length > 0) groups.push({ label: "Otros", options: others });

  return groups;
}
