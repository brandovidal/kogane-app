import {
  CalendarClock,
  CalendarRange,
  CircleCheck,
  Coins,
  ListFilter,
  Tags,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useCategories, usePaymentMethods } from "@/shared/api/hooks/catalogs";
import {
  EXPENSE_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/shared/constants/finance";
import { SUBSCRIPTION_PERIOD_LABELS } from "@/features/subscriptions/constants/subscriptions";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import { PaymentMethodIcon } from "@/features/settings/components/PaymentMethodIcon";
import { FilterSelect } from "@/shared/components/filters/FilterSelect";
import { PeriodFilterFields } from "@/shared/components/filters/PeriodFilterFields";
import { DatePicker } from "@/shared/components/forms/DatePicker";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import type { ExpenseFilterKey } from "../../types/expense-filters";
import type { ExpenseFiltersProps } from "../../types/expense-filter-props";
import { useExpensePersonOptions } from "../../hooks/useExpensePersonOptions";
import {
  PERSON_ALL,
  PERSON_FILTER_LABELS,
  CURRENCY_FILTER_OPTIONS,
  SHARED_FILTER_OPTIONS,
} from "../../constants/expense-filters";

const entriesOf = (labels: Record<string, string>, keys?: string[]) =>
  (keys ?? Object.keys(labels)).map((key) => ({
    value: key,
    label: labels[key] ?? key,
  }));

export function ExpenseFilterFields({
  fields,
  value,
  onChange,
  statuses,
  personInPanel,
  panel,
}: Pick<
  ExpenseFiltersProps,
  "fields" | "value" | "onChange" | "statuses" | "personInPanel"
> & { panel: boolean }) {
  const categories = useCategories().data ?? [];
  const methods =
    usePaymentMethods().data?.filter((method) => method.isActive) ?? [];
  const personOptions = useExpensePersonOptions();
  const has = (key: ExpenseFilterKey) => fields.includes(key);
  const set = (key: ExpenseFilterKey, next: string | undefined) =>
    onChange({ ...value, [key]: next || undefined });
  const width = panel ? "w-full" : undefined;
  return (
    <>
      {(has("month") || has("year")) && (
        <PeriodFilterFields
          month={value.month}
          year={value.year}
          showMonth={has("month")}
          showYear={has("year")}
          onMonthChange={(next) => set("month", next)}
          onYearChange={(next) => set("year", next)}
        />
      )}
      {personInPanel && has("person") && (
        <FilterSelect
          label="Persona"
          icon={UserRound}
          value={value.person ?? PERSON_ALL}
          options={personOptions}
          onChange={(next) => set("person", next)}
          allValue={PERSON_ALL}
          allLabel={PERSON_FILTER_LABELS.ALL}
          width={width}
          searchable={panel}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("category") && (
        <FilterSelect
          label="Categoría"
          icon={Tags}
          value={value.category}
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
          onChange={(next) => set("category", next)}
          width={width}
          searchable={panel}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("method") && (
        <FilterSelect
          label="Medio de pago"
          icon={WalletCards}
          value={value.method}
          options={methods.map((method) => ({
            value: method.id,
            label: method.name,
            decoration: (
              <PaymentMethodIcon type={method.type} color={method.color} />
            ),
          }))}
          onChange={(next) => set("method", next)}
          width={width}
          searchable={panel}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("currency") && (
        <FilterSelect
          label="Moneda"
          icon={Coins}
          value={value.currency}
          options={CURRENCY_FILTER_OPTIONS}
          onChange={(next) => set("currency", next)}
          width={width}
          searchable={panel}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("status") && (
        <FilterSelect
          label="Estado"
          icon={CircleCheck}
          value={value.status}
          options={entriesOf(PAYMENT_STATUS_LABELS, statuses)}
          onChange={(next) => set("status", next)}
          width={width}
          searchable={panel}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("period") && (
        <FilterSelect
          label="Periodo"
          icon={CalendarClock}
          value={value.period}
          options={entriesOf(SUBSCRIPTION_PERIOD_LABELS)}
          onChange={(next) => set("period", next)}
          width={width}
          searchable={panel}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("type") && (
        <FilterSelect
          label="Tipo"
          icon={ListFilter}
          value={value.type}
          options={entriesOf(EXPENSE_TYPE_LABELS)}
          onChange={(next) => set("type", next)}
          width={width ?? "w-[130px]"}
          searchable={panel}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("shared") && (
        <FilterSelect
          label="Compartidos"
          icon={UsersRound}
          value={value.shared}
          options={SHARED_FILTER_OPTIONS}
          onChange={(next) => set("shared", next)}
          width={width ?? "w-[180px]"}
          searchable={panel}
          labelClassName="text-sm font-medium"
        />
      )}
      {(has("dueFrom") || has("dueTo")) && (
        <div className="space-y-2 rounded-lg border p-3">
          <div>
            <div className="text-sm font-medium">
              <FieldLabel icon={CalendarRange}>Vencimiento</FieldLabel>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {has("dueFrom") && (
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground">Desde</div>
                <DatePicker
                  ariaLabel="Fecha de vencimiento desde"
                  value={value.dueFrom}
                  onChange={(next) => set("dueFrom", next)}
                  maxDate={value.dueTo}
                  placeholder="Cualquier fecha"
                />
              </div>
            )}
            {has("dueTo") && (
              <div className="space-y-1.5">
                <div className="text-xs text-muted-foreground">Hasta</div>
                <DatePicker
                  ariaLabel="Fecha de vencimiento hasta"
                  value={value.dueTo}
                  onChange={(next) => set("dueTo", next)}
                  minDate={value.dueFrom}
                  placeholder="Cualquier fecha"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
