import { useEffect, useRef, useState } from "react";
import {
  DATA_TABLE_CALCULATIONS,
  type DataTableCalculation,
  type DataTableCalculationSelection,
} from "@/shared/types/data-table-calculation";

const storageKeyFor = (tableKey: string) => `kogane:table-calculations:${tableKey}`;

export function useDataTableCalculations(
  tableKey?: string,
  defaults: DataTableCalculationSelection = {},
) {
  const defaultsRef = useRef(defaults);
  const [selection, setSelection] = useState<DataTableCalculationSelection>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!tableKey) {
      setLoaded(true);
      return;
    }
    try {
      const raw = window.localStorage.getItem(storageKeyFor(tableKey));
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const valid = Object.fromEntries(
          Object.entries(parsed).filter((entry): entry is [string, DataTableCalculation] =>
            DATA_TABLE_CALCULATIONS.includes(entry[1] as DataTableCalculation),
          ),
        );
        setSelection({ ...defaultsRef.current, ...valid });
      } else {
        setSelection(defaultsRef.current);
      }
    } catch {
      setSelection(defaultsRef.current);
    }
    setLoaded(true);
  }, [tableKey]);

  useEffect(() => {
    if (!loaded || !tableKey) return;
    try {
      window.localStorage.setItem(storageKeyFor(tableKey), JSON.stringify(selection));
    } catch {
      // The current selection remains usable for this session when storage is unavailable.
    }
  }, [loaded, selection, tableKey]);

  const setCalculation = (columnId: string, calculation: DataTableCalculation) =>
    setSelection((current) => ({ ...current, [columnId]: calculation }));

  return { selection, setCalculation };
}
