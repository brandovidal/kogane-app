import { usePaymentMethods, useCategories } from "@/shared/api/hooks/catalogs";
import { ExpensePersonFilter } from "@/features/expenses/components/filters/ExpensePersonFilter";
import { MoreFilters } from "@/shared/components/filters/MoreFilters";
import { FilterSelect } from "@/shared/components/filters/FilterSelect";
import { MultiSelect } from "@/shared/components/filters/MultiSelect";
import { Input } from "@/ui/input";
import { PaymentMethodIcon } from "@/features/settings/components/PaymentMethodIcon";
import { PAYMENT_METHOD_TYPE_LABELS } from "@/features/settings/constants/payment-methods";
import { EXPENSE_TYPE_LABELS, PAYMENT_STATUS_DOT_COLORS, PAYMENT_STATUS_GROUPS, PAYMENT_STATUS_LABELS } from "@/shared/constants/finance";
import { CURRENCY_FILTER_OPTIONS, NO_STATUS_FILTER, SHARED_FILTER_OPTIONS } from "@/features/expenses/constants/expense-filters";
import { countActiveExpenseFilters } from "@/features/expenses/lib/expense-filters";
import { countPlatformFilters } from "../../lib/platform-filters";
import type { ExpenseFilterKey, ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import { Tags, WalletCards, CircleCheck, Coins, ListFilter, UsersRound, StickyNote, Banknote } from "lucide-react";

const MORE_FILTER_KEYS: readonly ExpenseFilterKey[] = [
  "currency",
  "type",
  "hasNote",
  "methodType",
  "category",
  "shared",
  "amountFrom",
  "amountTo",
];

export function PlatformFilterFields({
  filters,
  onFiltersChange,
  personCounts,
  statuses,
}: {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  personCounts: Record<string, number>;
  statuses: string[];
}) {
  const methods = usePaymentMethods().data?.filter((method) => method.isActive) ?? [];
  const categories = useCategories().data ?? [];
  const set = (key: ExpenseFilterKey, value: string | undefined) =>
    onFiltersChange({ ...filters, [key]: value || undefined });
  const selectedPeople = countActiveExpenseFilters(filters, ["person"]);
  const whoWhereCount = selectedPeople + Number(Boolean(filters.method));
  const moreCount = countPlatformFilters(filters, MORE_FILTER_KEYS);
  const amountPrefix = filters.currency === "USD" ? "$" : "S/";
  const accountOptions = methods.map((method) => ({
    value: method.id,
    label: method.name,
    decoration: <PaymentMethodIcon type={method.type} color={method.color} />,
  }));
  const methodTypeOptions = Object.entries(PAYMENT_METHOD_TYPE_LABELS).map(
    ([value, label]) => ({ value, label }),
  );

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <MultiSelect
          label="Estado"
          icon={CircleCheck}
          value={
            filters.status === NO_STATUS_FILTER
              ? []
              : filters.status?.split(",").filter(Boolean) ?? null
          }
          options={statuses.map((value) => ({
            value,
            label: PAYMENT_STATUS_LABELS[value] ?? value,
            group: PAYMENT_STATUS_GROUPS.find((group) =>
              (group.statuses as readonly string[]).includes(value),
            )?.label ?? "Otros",
            color: PAYMENT_STATUS_DOT_COLORS[value],
          }))}
          onChange={(value) =>
            set(
              "status",
              value === null
                ? undefined
                : value.length
                  ? value.join(",")
                  : NO_STATUS_FILTER,
            )
          }
          width="w-full"
          allLabel="Todos los estados"
          emptySelectionLabel="Ninguno"
          searchable
          activeMarker
          labelClassName="text-sm font-medium"
        />
      </section>

      <section className="space-y-3">
        <div className="eyebrow flex items-center gap-1.5">
          Quién y dónde
          {whoWhereCount > 0 && (
            <span className="normal-case tracking-normal text-brand">
              · {whoWhereCount} aplicado{whoWhereCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ExpensePersonFilter
            compact
            value={filters.person}
            onChange={(person) => set("person", person)}
            searchable
            counts={personCounts}
          />
          <FilterSelect
            label="Cuenta de cobro"
            icon={WalletCards}
            value={filters.method}
            options={accountOptions}
            onChange={(method) => set("method", method)}
            width="w-full"
            allLabel="Todas las cuentas"
            allTriggerLabel="Todas"
            searchable
            labelClassName="text-sm font-medium"
          />
        </div>
      </section>

      <MoreFilters
        activeCount={moreCount}
        activeCountDisplay="inline"
        defaultOpen
      >
        <div className="grid grid-cols-2 gap-3">
          <FilterSelect
            label="Moneda"
            icon={Coins}
            value={filters.currency}
            options={CURRENCY_FILTER_OPTIONS}
            onChange={(value) => set("currency", value)}
            width="w-full"
            searchable
            labelClassName="text-sm font-medium"
          />
          <FilterSelect
            label="Tipo de gasto"
            icon={ListFilter}
            value={filters.type}
            options={Object.entries(EXPENSE_TYPE_LABELS).map(
              ([value, label]) => ({ value, label }),
            )}
            onChange={(value) => set("type", value)}
            width="w-full"
            searchable
            labelClassName="text-sm font-medium"
          />
          <FilterSelect
            label="Con nota"
            icon={StickyNote}
            value={filters.hasNote}
            options={[
              { value: "yes", label: "Con nota" },
              { value: "no", label: "Sin nota" },
            ]}
            onChange={(value) => set("hasNote", value as "yes" | "no" | undefined)}
            width="w-full"
            allLabel="Todas"
            allTriggerLabel="Todas"
            labelClassName="text-sm font-medium"
          />
          <FilterSelect
            label="Medio de pago"
            icon={WalletCards}
            value={filters.methodType}
            options={methodTypeOptions}
            onChange={(value) => set("methodType", value)}
            width="w-full"
            searchable
            labelClassName="text-sm font-medium"
          />
          <div className="col-span-2 space-y-2 rounded-lg border p-3">
            <div className="text-sm font-medium">
              <Banknote className="mr-2 inline size-4 text-muted-foreground" />
              Monto
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 text-xs text-muted-foreground">
                Desde
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {amountPrefix}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={filters.amountFrom ?? ""}
                    placeholder="0.00"
                    className="pl-10"
                    onChange={(event) => set("amountFrom", event.target.value)}
                  />
                </div>
              </label>
              <label className="space-y-1.5 text-xs text-muted-foreground">
                Hasta
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {amountPrefix}
                  </span>
                  <Input
                    type="number"
                    min={filters.amountFrom ?? "0"}
                    step="0.01"
                    value={filters.amountTo ?? ""}
                    placeholder="Sin límite"
                    className="pl-10"
                    onChange={(event) => set("amountTo", event.target.value)}
                  />
                </div>
              </label>
            </div>
          </div>
          <FilterSelect
            label="Categoría"
            icon={Tags}
            value={filters.category}
            options={categories.map((category) => ({
              value: category.id,
              label: category.name,
              decoration: (
                <CategoryIcon
                  icon={category.icon}
                  color={category.color}
                  size="xs"
                />
              ),
            }))}
            onChange={(value) => set("category", value)}
            width="w-full"
            searchable
            multiple
            labelClassName="text-sm font-medium"
          />
          <FilterSelect
            label="Compartidos"
            icon={UsersRound}
            value={filters.shared}
            options={SHARED_FILTER_OPTIONS}
            onChange={(value) => set("shared", value)}
            width="w-full"
            labelClassName="text-sm font-medium"
          />
        </div>
      </MoreFilters>
    </div>
  );
}
