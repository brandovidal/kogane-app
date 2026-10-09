import { CategoryFilterFields } from "@/shared/components/filters/CategoryFilterFields";
import { PersonFilterFields } from "@/shared/components/filters/PersonFilterFields";
import { MoreFilters } from "@/shared/components/filters/MoreFilters";
import { CurrencyFilterFields } from "@/shared/components/filters/CurrencyFilterFields";
import { ExpenseTypeFilterFields } from "@/shared/components/filters/ExpenseTypeFilterFields";
import { NoteFilterFields } from "@/shared/components/filters/NoteFilterFields";
import { PaymentMethodTypeFilterFields } from "@/shared/components/filters/PaymentMethodTypeFilterFields";
import { SharedFilterFields } from "@/shared/components/filters/SharedFilterFields";
import { BillingPeriodFilterFields } from "../../components/BillingPeriodFilterFields";
import { StatusFilterFields } from "@/shared/components/filters/StatusFilterFields";
import { PaymentMethodFilterFields } from "@/shared/components/filters/PaymentMethodFilterFields";
import { Input } from "@/ui/input";
import { countPlatformFilters } from "../../lib/platform-filters";
import { PLATFORM_MORE_FILTER_KEYS } from "../../constants/platforms";
import type {
  ExpenseFilterKey,
  ExpenseFilterValues,
} from "@/features/expenses/types/expense-filters";

export function PlatformFilterFields({
  filters,
  onFiltersChange,
  personCounts,
  paymentMethodCounts,
  statuses,
}: {
  filters: ExpenseFilterValues;
  onFiltersChange: (filters: ExpenseFilterValues) => void;
  personCounts: Record<string, number>;
  paymentMethodCounts: Record<string, number>;
  statuses: string[];
}) {
  const set = (key: ExpenseFilterKey, value: string | undefined) =>
    onFiltersChange({ ...filters, [key]: value || undefined });
  const moreCount = countPlatformFilters(filters, PLATFORM_MORE_FILTER_KEYS);
  const amountPrefix = filters.currency === "USD" ? "$" : "S/";

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
        <PaymentMethodFilterFields
          label="Cuenta de cobro"
          value={filters.method}
          onChange={(method) => set("method", method)}
          counts={paymentMethodCounts}
          width="w-full"
          allLabel="Todas las cuentas"
          activeMarker
          labelClassName="text-sm font-medium"
          presentation="popover"
        />
      </section>

      <MoreFilters
        activeCount={moreCount}
        activeCountDisplay="inline"
        defaultOpen
      >
        <div className="grid grid-cols-2 gap-3">
          <CurrencyFilterFields
            label="Moneda"
            value={filters.currency}
            onChange={(value) => set("currency", value)}
            width="w-full"
            activeMarker
            labelClassName="text-sm font-medium"
          />
          <ExpenseTypeFilterFields
            label="Tipo de gasto"
            value={filters.type}
            onChange={(value) => set("type", value)}
            width="w-full"
            activeMarker
            labelClassName="text-sm font-medium"
          />
          <NoteFilterFields
            label="Con nota"
            value={filters.hasNote}
            onChange={(value) =>
              set("hasNote", value as "yes" | "no" | undefined)
            }
            width="w-full"
            allLabel="Todas"
            activeMarker
            labelClassName="text-sm font-medium"
          />
          <PaymentMethodTypeFilterFields
            label="Medio de pago"
            value={filters.methodType}
            onChange={(value) => set("methodType", value)}
            width="w-full"
            activeMarker
            labelClassName="text-sm font-medium"
          />
          <BillingPeriodFilterFields
            label="Período de cobro"
            value={filters.period}
            onChange={(value) => set("period", value)}
            width="w-full"
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
          <CategoryFilterFields
            label="Categoría"
            value={filters.category}
            onChange={(value) => set("category", value)}
            width="w-full"
            activeMarker
            presentation="popover"
            labelClassName="text-sm font-medium"
          />
          <SharedFilterFields
            label="Compartidos"
            value={filters.shared}
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
