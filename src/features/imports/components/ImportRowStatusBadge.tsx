import type { ImportRowStatusBadgeProps } from "../types/import-types";
import { Badge } from "@/ui/badge";
import { ROW_STATUS } from "@/features/imports/constants/import-options";

export function ImportRowStatusBadge({ status }: ImportRowStatusBadgeProps) {
  const { label, variant } = ROW_STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}
