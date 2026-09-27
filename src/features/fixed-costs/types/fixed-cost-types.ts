import type { FixedCost } from "@/shared/api/types";

export type FixedCostBulkAction = "duplicate" | "delete" | "status";
export interface FixedCostBulkFailure {
  id: string;
  name: string;
  message: string;
}

export type FixedCostGroupBy = "none" | "person" | "category";
export type CatalogName = (id?: string | null) => string;

export interface FixedCostActions {
  onOpen: (cost: FixedCost) => void;
  onEdit: (cost: FixedCost) => void;
  onDuplicate: (cost: FixedCost) => void;
  onNextMonth: (cost: FixedCost) => void;
  onMove: (cost: FixedCost) => void;
  onDelete: (cost: FixedCost) => void | Promise<unknown>;
  onStatusChange: (cost: FixedCost, status: string) => void;
}
