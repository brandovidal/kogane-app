import { Pencil, Trash2 } from "lucide-react";
import type { Income } from "../hooks/budget";
import type { Column } from "@/shared/types/data-view";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { Button } from "@/ui/button";

export interface IncomeColumnActions {
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
  deleting?: boolean;
}

export function incomeColumns({
  onEdit,
  onDelete,
  deleting,
}: IncomeColumnActions): Column<Income>[] {
  return [
    {
      key: "date",
      header: "Fecha de recepción",
      cell: (income) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(income.receivedAt)}
        </span>
      ),
    },
    {
      key: "description",
      header: "Descripción",
      role: "title",
      cell: (income) => (
        <span className="font-medium">{income.description}</span>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      cell: (income) => (
        <span className="font-semibold tabular-nums">
          {formatCurrency(income.amount, income.currency)}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Nota",
      cell: (income) => (
        <span className="text-sm text-muted-foreground">
          {income.notes ?? "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[80px]",
      cell: (income) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`Editar ${income.description}`}
            onClick={() => onEdit(income)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive"
            aria-label={`Eliminar ${income.description}`}
            disabled={deleting}
            onClick={() => onDelete(income)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
