import type { Category, FixedCost } from "@/shared/api/types";
import { EXPENSE_TYPE_LABELS, PAYMENT_STATUS_LABELS } from "@/shared/constants/finance";
import { formatDate } from "@/shared/lib/dates";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import type { CatalogName } from "@/features/fixed-costs/types/fixed-cost-types";
import type { CsvExportData } from "@/shared/types/csv-export";

export type FixedCostExportData = CsvExportData;

export function buildFixedCostExport({
  items, categories, personName, accountName, filters, month, year,
}: {
  items: FixedCost[];
  categories: Category[];
  personName: CatalogName;
  accountName: CatalogName;
  filters: ExpenseFilterValues;
  month: number;
  year: number;
}): FixedCostExportData {
  return {
    filename: filters.dueFrom || filters.dueTo
      ? `costos-fijos-vencimiento-${filters.dueFrom ?? "inicio"}-${filters.dueTo ?? "fin"}`
      : `costos-fijos-${year}-${String(month).padStart(2, "0")}`,
    headers: ["Descripción", "Categoría", "Monto", "Moneda", "Estado", "Tipo", "Persona", "Vencimiento", "Cuenta", "Cuota"],
    rows: items.map((cost) => [
      cost.description,
      categories.find((category) => category.id === cost.categoryId)?.name ?? "",
      cost.amount,
      cost.currency,
      PAYMENT_STATUS_LABELS[cost.paymentStatus] ?? cost.paymentStatus,
      EXPENSE_TYPE_LABELS[cost.expenseType] ?? cost.expenseType,
      personName(cost.personId),
      cost.dueDate ? formatDate(cost.dueDate) : "",
      accountName(cost.paymentMethodId),
      cost.installment ?? "",
    ]),
  };
}
