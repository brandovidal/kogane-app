import type { FixedCostBulkAction } from "../types/fixed-cost-types";

export const FIXED_COST_BULK_LABELS: Record<FixedCostBulkAction, string> = {
  duplicate: "registros duplicados",
  delete: "registros eliminados",
  status: "registros actualizados",
};
