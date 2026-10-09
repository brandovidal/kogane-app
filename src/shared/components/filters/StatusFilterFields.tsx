import type { LucideIcon } from "lucide-react";

import { MultiSelect } from "@/shared/components/filters/MultiSelect";
import {
  NO_PAYMENT_STATUS_FILTER,
  PAYMENT_STATUS_DOT_COLORS,
  PAYMENT_STATUS_GROUPS,
  PAYMENT_STATUS_LABELS,
} from "@/shared/constants/finance";

export interface StatusFilterFieldsProps {
  statuses?: readonly string[];
  value?: string;
  onChange: (value: string | undefined) => void;
  label?: string;
  allLabel?: string;
  emptySelectionLabel?: string;
  activeMarker?: boolean;
  icon?: LucideIcon;
  width?: string;
  labelClassName?: string;
}

export function StatusFilterFields({
  statuses = Object.keys(PAYMENT_STATUS_LABELS),
  value,
  onChange,
  label = "Estado",
  allLabel = "Todos los estados",
  emptySelectionLabel = "Ninguno",
  activeMarker = false,
  icon,
  width,
  labelClassName = "text-sm font-medium",
}: StatusFilterFieldsProps) {
  const groups = new Map<string, string>();
  for (const group of PAYMENT_STATUS_GROUPS) {
    for (const status of group.statuses) groups.set(status, group.label);
  }

  return (
    <MultiSelect
      label={label}
      value={
        value === NO_PAYMENT_STATUS_FILTER
          ? []
          : value?.split(",").filter(Boolean) ?? null
      }
      options={statuses.map((status) => ({
        value: status,
        label: PAYMENT_STATUS_LABELS[status] ?? status,
        group: groups.get(status) ?? "Otros",
        color: PAYMENT_STATUS_DOT_COLORS[status],
      }))}
      onChange={(next) =>
        onChange(
          next === null
            ? undefined
            : next.length
              ? next.join(",")
              : NO_PAYMENT_STATUS_FILTER,
        )
      }
      allLabel={allLabel}
      emptySelectionLabel={emptySelectionLabel}
      activeMarker={activeMarker}
      icon={icon}
      width={width}
      searchable
      labelClassName={labelClassName}
    />
  );
}
