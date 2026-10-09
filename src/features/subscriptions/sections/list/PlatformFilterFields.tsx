import { usePaymentMethods, useCategories } from "@/shared/api/hooks/catalogs";
import { PersonFilterFields } from "@/shared/components/filters/PersonFilterFields";
import { MoreFilters } from "@/shared/components/filters/MoreFilters";
import { FilterSelect } from "@/shared/components/filters/FilterSelect";
import { StatusFilterFields } from "@/shared/components/filters/StatusFilterFields";
import { Input } from "@/ui/input";
import { PaymentMethodIcon } from "@/features/settings/components/PaymentMethodIcon";
import { PAYMENT_METHOD_TYPE_LABELS } from "@/features/settings/constants/payment-methods";
import { EXPENSE_TYPE_LABELS } from "@/shared/constants/finance";
import { CURRENCY_FILTER_OPTIONS, SHARED_FILTER_OPTIONS } from "@/features/expenses/constants/expense-filters";
import { countPlatformFilters } from "../../lib/platform-filters";
import { PLATFORM_MORE_FILTER_KEYS } from "../../constants/platforms";
import type { ExpenseFilterKey, ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";

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
  const moreCount = countPlatformFilters(filters, PLATFORM_MORE_FILTER_KEYS);
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
        <StatusFilterFields
          statuses={statuses}
          value={filters.status}
          onChange={(value) => set("status", value)}
          width="w-full"
          activeMarker
        />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <PersonFilterFields
          value={filters.person}
          onChange={(person) => set("person", person)}
          counts={personCounts}
          presentation="popover"
          labelClassName="text-sm font-medium"
        />
        <FilterSelect
          label="Cuenta de cobro"
          value={filters.method}
          options={accountOptions}
          onChange={(method) => set("method", method)}
          width="w-full"
          allLabel="Todas las cuentas"
          allTriggerLabel="Todas"
          searchable
          activeMarker
          labelClassName="text-sm font-medium"
        />
      </section>

      <MoreFilters
        activeCount={moreCount}
        activeCountDisplay="inline"
        defaultOpen
      >
        <div className="grid grid-cols-2 gap-3">
          <FilterSelect
            label="Moneda"
            value={filters.currency}
            options={CURRENCY_FILTER_OPTIONS}
            onChange={(value) => set("currency", value)}
            width="w-full"
            searchable
            activeMarker
            labelClassName="text-sm font-medium"
          />
          <FilterSelect
            label="Tipo de gasto"
            value={filters.type}
            options={Object.entries(EXPENSE_TYPE_LABELS).map(
              ([value, label]) => ({ value, label }),
            )}
            onChange={(value) => set("type", value)}
            width="w-full"
            searchable
            activeMarker
            labelClassName="text-sm font-medium"
          />
          <FilterSelect
            label="Con nota"
            value={filters.hasNote}
            options={[
              { value: "yes", label: "Con nota" },
              { value: "no", label: "Sin nota" },
            ]}
            onChange={(value) => set("hasNote", value as "yes" | "no" | undefined)}
            width="w-full"
            allLabel="Todas"
            allTriggerLabel="Todas"
            activeMarker
            labelClassName="text-sm font-medium"
          />
          <FilterSelect
            label="Medio de pago"
            value={filters.methodType}
            options={methodTypeOptions}
            onChange={(value) => set("methodType", value)}
            width="w-full"
            searchable
            activeMarker
            labelClassName="text-sm font-medium"
          />
          <div className="col-span-2 space-y-2 rounded-lg border p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              {(filters.amountFrom || filters.amountTo) && (
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-brand"
                />
              )}
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
            activeMarker
            labelClassName="text-sm font-medium"
          />
          <FilterSelect
            label="Compartidos"
            value={filters.shared}
            options={SHARED_FILTER_OPTIONS}
            onChange={(value) => set("shared", value)}
            width="w-full"
            activeMarker
            labelClassName="text-sm font-medium"
          />
        </div>
      </MoreFilters>
    </div>
  );
}
