import { MessageSquareText, Pencil, Tags, UsersRound } from "lucide-react";

import type { Category, DailyExpense } from "@/shared/api/types";
import { CurrencyDisplay } from "@/features/expenses/components/CurrencyDisplay";
import { RowActions } from "@/features/expenses/components/RowActions";
import { EXPENSE_TYPE_LABELS } from "@/shared/constants/finance";
import { formatDate } from "@/shared/lib/dates";
import { Badge } from "@/ui/badge";
import { CategoryLabel } from "@/features/categories/components/CategoryLabel";
import type { Column } from "@/shared/types/data-view";

type CatalogName = (id?: string | null) => string;

export interface DailyExpenseColumnOptions {
  categories: Category[];
  methodName: CatalogName;
  personName: CatalogName;
  onEdit: (expense: DailyExpense) => void;
  onOrigin: (expense: DailyExpense) => void;
  onDuplicate: (expense: DailyExpense) => void;
  onDelete: (expense: DailyExpense) => void;
}

export function createDailyExpenseColumns({
  categories,
  methodName,
  personName,
  onEdit,
  onOrigin,
  onDuplicate,
  onDelete,
}: DailyExpenseColumnOptions): Column<DailyExpense>[] {
  return [
    {
      key: "description",
      header: "Descripción",
      role: "title",
      cell: (expense) => (
        <div className="min-w-0">
          <span className="font-medium">{expense.description}</span>
          {expense.expenseType === "guilty_pleasure" && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {EXPENSE_TYPE_LABELS.guilty_pleasure}
            </Badge>
          )}
          {expense.merchant && <p className="text-xs text-muted-foreground">{expense.merchant}</p>}
        </div>
      ),
      cardCell: (expense) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground">
            {expense.description.trim().charAt(0).toLocaleUpperCase() || "?"}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium">
              {expense.description}
              {expense.expenseType === "guilty_pleasure" && (
                <Badge variant="secondary" className="ml-2 align-middle text-xs">
                  {EXPENSE_TYPE_LABELS.guilty_pleasure}
                </Badge>
              )}
            </span>
            <span className="block truncate text-xs text-muted-foreground">{expense.merchant || "Sin comercio"}</span>
          </span>
        </div>
      ),
    },
    {
      key: "date",
      header: "Fecha",
      cell: (expense) => <span className="text-sm text-muted-foreground">{formatDate(expense.spentAt)}</span>,
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      cell: (expense) => (
        <CurrencyDisplay amount={expense.amount} currency={expense.currency} amountInPEN={expense.amountInPen} othersShare={expense.othersShare} />
      ),
    },
    {
      key: "method",
      header: "Medio de pago",
      cell: (expense) => <span className="text-sm">{methodName(expense.paymentMethodId)}</span>,
    },
    {
      key: "category",
      header: "Categoría",
      cell: (expense) => {
        const category = categories.find((item) => item.id === expense.categoryId);
        return category ? <CategoryLabel name={category.name} icon={category.icon} color={category.color} className="text-sm" /> : "—";
      },
    },
    {
      key: "person",
      header: "Persona",
      cell: (expense) => <span className="text-sm">{personName(expense.personId)}</span>,
    },
    {
      key: "origin",
      header: "Origen",
      cell: (expense) => {
        const message = !!expense.draftId;
        const Icon = message ? MessageSquareText : Pencil;
        return (
          <Badge variant="outline" className="gap-1.5 text-xs text-muted-foreground">
            <Icon className="size-3" />
            {message ? "Mensaje" : "Manual"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[50px]",
      cell: (expense) => (
        <RowActions
          label={expense.description}
          files={{ refType: "expense", refId: expense.id }}
          history={{ entity: "exp_daily_expenses", id: expense.id }}
          onEdit={() => onEdit(expense)}
          extraItems={[
            {
              label: "Cambiar categoría",
              icon: Tags,
              onSelect: () => onEdit(expense),
            },
            {
              label: "Repartir con otras personas",
              icon: UsersRound,
              onSelect: () => onEdit(expense),
            },
            {
              label: "Ver mensaje de origen",
              icon: MessageSquareText,
              hint: expense.draftId ? undefined : "Registrado a mano",
              onSelect: () => expense.draftId && onOrigin(expense),
            },
          ]}
          onDuplicate={() => onDuplicate(expense)}
          onDelete={() => onDelete(expense)}
        />
      ),
    },
  ];
}
