export const DATA_TABLE_CALCULATIONS = [
  "none",
  "count",
  "count-values",
  "count-unique",
  "count-empty",
  "sum",
  "average",
  "median",
  "min",
  "max",
  "range",
] as const;

export type DataTableCalculation = (typeof DATA_TABLE_CALCULATIONS)[number];
export type DataTableCalculationSelection = Record<string, DataTableCalculation>;

export interface DataTableCalculationState {
  selection: DataTableCalculationSelection;
  setCalculation: (columnId: string, calculation: DataTableCalculation) => void;
}
