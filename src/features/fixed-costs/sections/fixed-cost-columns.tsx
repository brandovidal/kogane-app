import type { Category, FixedCost } from "@/shared/api/types";
import { CategoryLabel } from "@/features/categories/components/CategoryLabel";
import { CurrencyDisplay } from "@/features/expenses/components/CurrencyDisplay";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { type Column } from "@/shared/types/data-view";
import { RowActions } from "@/features/expenses/components/RowActions";
import { FIXED_COST_STATUSES } from "@/features/fixed-costs/constants/statuses";
import { formatDate } from "@/shared/lib/dates";
import { FixedCostName } from "../components/FixedCostName";
import type { CatalogName, FixedCostActions } from "@/features/fixed-costs/types/fixed-cost-types";

export function getFixedCostColumns({ categories, personName, accountName, actions }: {
  categories: Category[];
  personName: CatalogName;
  accountName: CatalogName;
  actions: FixedCostActions;
}): Column<FixedCost>[] {
  return [
    {
      key: "description", header: "Descripción", role: "title",
      cell: (cost) => <FixedCostName cost={cost} onOpen={() => actions.onOpen(cost)} />,
    },
    {
      key: "category", header: "Categoría",
      cell: (cost) => {
        const category = categories.find((item) => item.id === cost.categoryId);
        return category ? <CategoryLabel name={category.name} icon={category.icon} color={category.color} className="text-sm" /> : "—";
      },
    },
    {
      key: "amount", header: "Monto", role: "amount",
      cell: (cost) => <CurrencyDisplay amount={cost.amount} currency={cost.currency} amountInPEN={cost.amountInPen} othersShare={cost.othersShare} />,
    },
    {
      key: "status", header: "Estado",
      cell: (cost) => <StatusBadge status={cost.paymentStatus} />,
    },
    { key: "person", header: "Persona", cell: (cost) => <span className="text-sm">{personName(cost.personId)}</span> },
    {
      key: "due", header: "Vencimiento",
      cell: (cost) => <span className="text-sm text-muted-foreground">{cost.dueDate ? formatDate(cost.dueDate) : "—"}</span>,
    },
    { key: "account", header: "Cuenta", cell: (cost) => <span className="text-sm">{accountName(cost.paymentMethodId)}</span> },
    {
      key: "actions", header: "", role: "actions", className: "w-[50px]",
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
          status={{ value: cost.paymentStatus, options: FIXED_COST_STATUSES, onChange: (status) => actions.onStatusChange(cost, status) }}
        />
      ),
    },
  ];
}
