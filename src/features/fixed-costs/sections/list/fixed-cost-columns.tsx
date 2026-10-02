import type { Category, FixedCost } from "@/shared/api/types";
import { CategoryLabel } from "@/features/categories/components/CategoryLabel";
import { CurrencyDisplay } from "@/features/expenses/components/CurrencyDisplay";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { type Column } from "@/shared/types/data-view";
import { RowActions } from "@/features/expenses/components/RowActions";
import { FIXED_COST_STATUSES } from "@/features/fixed-costs/constants/statuses";
import { formatDate } from "@/shared/lib/dates";
import { formatCurrency } from "@/shared/lib/currency";
import { PAYMENT_STATUS_LABELS } from "@/shared/constants/finance";
import { FixedCostName } from "../../components/list/FixedCostName";
import type {
  CatalogName,
  FixedCostActions,
} from "@/features/fixed-costs/types/fixed-cost-types";

export function getFixedCostColumns({
  categories,
  personName,
  accountName,
  actions,
}: {
  categories: Category[];
  personName: CatalogName;
  accountName: CatalogName;
  actions: FixedCostActions;
}): Column<FixedCost>[] {
  return [
    {
      key: "description",
      header: "Descripción",
      role: "title",
      accessor: (cost) => cost.description,
      cell: (cost) => (
        <FixedCostName cost={cost} onOpen={() => actions.onOpen(cost)} />
      ),
    },
    {
      key: "category",
      header: "Categoría",
      accessor: (cost) =>
        categories.find((item) => item.id === cost.categoryId)?.name,
      cell: (cost) => {
        const category = categories.find((item) => item.id === cost.categoryId);
        return category ? (
          <CategoryLabel
            name={category.name}
            icon={category.icon}
            color={category.color}
            className="text-sm"
          />
        ) : (
          "—"
        );
      },
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      className: "text-right",
      calculationType: "number",
      formatCalculation: (value) => formatCurrency(value, "PEN"),
      accessor: (cost) => cost.amountInPen ?? cost.amount,
      cell: (cost) => (
        <CurrencyDisplay
          amount={cost.amount}
          currency={cost.currency}
          amountInPEN={cost.amountInPen}
          othersShare={cost.othersShare}
        />
      ),
    },
    {
      key: "status",
      header: "Estado",
      accessor: (cost) =>
        PAYMENT_STATUS_LABELS[cost.paymentStatus] ?? cost.paymentStatus,
      cell: (cost) => <StatusBadge status={cost.paymentStatus} />,
    },
    {
      key: "person",
      header: "Persona",
      accessor: (cost) => personName(cost.personId),
      cell: (cost) => (
        <span className="text-sm">{personName(cost.personId)}</span>
      ),
    },
    {
      key: "due",
      header: "Vencimiento",
      accessor: (cost) => cost.dueDate,
      cell: (cost) => (
        <span className="text-sm text-muted-foreground">
          {cost.dueDate ? formatDate(cost.dueDate) : "—"}
        </span>
      ),
    },
    {
      key: "account",
      header: "Cuenta",
      accessor: (cost) => accountName(cost.paymentMethodId),
      cell: (cost) => (
        <span className="text-sm">{accountName(cost.paymentMethodId)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[50px]",
      cell: (cost) => (
        <RowActions
          label={cost.description}
          files={{ refType: "fixed_cost", refId: cost.id }}
          history={{ entity: "exp_fixed_costs", id: cost.id }}
          onEdit={() => actions.onEdit(cost)}
          onDuplicate={() => actions.onDuplicate(cost)}
          onNextMonth={() => actions.onNextMonth(cost)}
          onMove={() => actions.onMove(cost)}
          onDelete={() => actions.onDelete(cost)}
          status={{
            value: cost.paymentStatus,
            options: FIXED_COST_STATUSES,
            onChange: (status) => actions.onStatusChange(cost, status),
          }}
        />
      ),
    },
  ];
}
