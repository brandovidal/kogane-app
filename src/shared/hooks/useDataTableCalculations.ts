import { useCallback, useEffect } from "react";
import { useStore } from "zustand";
import type {
  DataTableCalculation,
  DataTableCalculationSelection,
} from "@/shared/types/data-table-calculation";
import { dataTableCalculationsStore } from "@/shared/stores/data-table-calculations.store";

export function useDataTableCalculations(
  tableKey?: string,
  defaults: DataTableCalculationSelection = {},
) {
  const selection = useStore(dataTableCalculationsStore, (state) =>
    tableKey ? (state.selections[tableKey] ?? defaults) : defaults,
  );

  useEffect(() => {
    if (tableKey)
      dataTableCalculationsStore.getState().initializeTable(tableKey, defaults);
  }, [tableKey, defaults]);

  const setCalculation = useCallback(
    (columnId: string, calculation: DataTableCalculation) => {
      if (tableKey)
        dataTableCalculationsStore
          .getState()
          .setCalculation(tableKey, columnId, calculation);
    },
    [tableKey],
  );

  return { selection, setCalculation };
}
