import type { DataTableCalculation } from "@/shared/types/data-table-calculation";

const isEmpty = (value: unknown) => value == null || value === "";

export function calculateTableColumn(values: unknown[], calculation: DataTableCalculation): number | null {
  const present = values.filter((value) => !isEmpty(value));
  switch (calculation) {
    case "none": return null;
    case "count": return values.length;
    case "count-values": return present.length;
    case "count-unique": return new Set(present.map((value) => String(value))).size;
    case "count-empty": return values.length - present.length;
    case "sum":
    case "average":
    case "median":
    case "min":
    case "max":
    case "range": {
      const numbers = present.filter((value): value is number => typeof value === "number" && Number.isFinite(value)).sort((a, b) => a - b);
      if (!numbers.length) return null;
      if (calculation === "sum") return numbers.reduce((sum, value) => sum + value, 0);
      if (calculation === "average") return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
      if (calculation === "median") {
        const middle = Math.floor(numbers.length / 2);
        return numbers.length % 2 ? numbers[middle] : (numbers[middle - 1] + numbers[middle]) / 2;
      }
      if (calculation === "min") return numbers[0];
      if (calculation === "max") return numbers[numbers.length - 1];
      return numbers[numbers.length - 1] - numbers[0];
    }
  }
}
