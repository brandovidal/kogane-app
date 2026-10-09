import type { Category, FixedCost } from "@/shared/api/types";
import { CategoryLabel } from "@/features/categories/components/CategoryLabel";
import { CurrencyDisplay } from "@/features/expenses/components/CurrencyDisplay";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { type Column } from "@/shared/types/data-view";
import { RowActions } from "@/features/expenses/components/RowActions";
import { FIXED_COST_STATUSES } from "@/features/fixed-costs/constants/statuses";
import { formatCurrency } from "@/shared/lib/currency";
import { PAYMENT_STATUS_LABELS } from "@/shared/constants/finance";
import { getMonthName } from "@/shared/lib/dates";

const shiftedMonthLabel = (cost: FixedCost, delta: number) => {
  const index = cost.paymentYear * 12 + cost.paymentMonth - 1 + delta;
  return `${getMonthName((index % 12) + 1)} ${Math.floor(index / 12)}`;
};
import { FixedCostName } from "../components/list/FixedCostName";
import { FixedCostDue } from "../components/list/FixedCostDue";
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
      className: "w-[22%] min-w-[180px]",
      role: "title",
      accessor: (cost) => cost.description,
      cell: (cost) => (
        <FixedCostName cost={cost} onOpen={() => actions.onOpen(cost)} />
      ),
      cardCell: (cost) => (
        <FixedCostName
          cost={cost}
          onOpen={() => actions.onOpen(cost)}
          showThumbnail={false}
        />
      ),
    },
    {
      key: "category",
      header: "Categoría",
      className: "w-[15%] min-w-[120px]",
      accessor: (cost) =>
        categories.find((item) => item.id === cost.categoryId)?.name,
      cell: (cost) => {
        const category = categories.find((item) => item.id === cost.categoryId);
        const isLoanCategory = category?.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .includes("prestam");
        return category ? (
          <CategoryLabel
            name={category.name}
            icon={category.icon}
            color={isLoanCategory ? "#a5b4fc" : category.color}
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
      className: "w-[12%] min-w-[110px] text-right",
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
      className: "w-[12%] min-w-[120px]",
      accessor: (cost) =>
        PAYMENT_STATUS_LABELS[cost.paymentStatus] ?? cost.paymentStatus,
      cell: (cost) => <StatusBadge status={cost.paymentStatus} />,
    },
    {
      key: "person",
      header: "Persona",
      className: "w-[13%] min-w-[120px]",
      accessor: (cost) => personName(cost.personId),
      cell: (cost) => {
        const name = personName(cost.personId);
        const initials = name
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase();
        return (
          <span className="inline-flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground/90"
            >
              {initials}
            </span>
            {name}
          </span>
        );
      },
    },
    {
      key: "due",
      header: "Vencimiento",
      className: "w-[14%] min-w-[120px]",
      accessor: (cost) => cost.dueDate,
      cell: (cost) => <FixedCostDue cost={cost} />,
    },
    {
      key: "account",
      header: "Cuenta",
      className: "w-[12%] min-w-[100px]",
      accessor: (cost) => accountName(cost.paymentMethodId),
      cell: (cost) => (
        <span className="text-sm">{accountName(cost.paymentMethodId)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-12 min-w-12",
      cell: (cost) => (
        <RowActions
          label={cost.description}
          files={{ refType: "fixed_cost", refId: cost.id }}
          history={{ entity: "exp_fixed_costs", id: cost.id }}
          onEdit={() => actions.onEdit(cost)}
          onDuplicate={() => actions.onDuplicate(cost)}
          onNextMonth={() => actions.onNextMonth(cost)}
          onPreviousMonth={() => actions.onPreviousMonth(cost)}
          monthLabels={{
            previous: shiftedMonthLabel(cost, -1),
            next: shiftedMonthLabel(cost, 1),
          }}
          onOpenFiles={() => actions.onOpen(cost, "files")}
          onOpenHistory={() => actions.onOpen(cost, "history")}
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
