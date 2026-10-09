import {
  CalendarClock,
  CalendarRange,
  CircleCheck,
  Coins,
  ListFilter,
  Tags,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useCategories, usePaymentMethods } from "@/shared/api/hooks/catalogs";
import { EXPENSE_TYPE_LABELS } from "@/shared/constants/finance";
import { SUBSCRIPTION_PERIOD_LABELS } from "@/features/subscriptions/constants/subscriptions";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import { PaymentMethodIcon } from "@/features/settings/components/PaymentMethodIcon";
import { FilterSelect } from "@/shared/components/filters/FilterSelect";
import { StatusFilterFields } from "@/shared/components/filters/StatusFilterFields";
import { PersonFilterFields } from "@/shared/components/filters/PersonFilterFields";
import { RecordSearchField } from "@/shared/components/filters/RecordSearchField";
import { MoreFilters } from "@/shared/components/filters/MoreFilters";
import { PeriodFilterFields } from "@/shared/components/filters/PeriodFilterFields";
import { DatePicker } from "@/shared/components/forms/DatePicker";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { cn } from "@/shared/utils/cn";
import { entriesOf } from "@/shared/utils/entries";
import { countActiveExpenseFilters } from "../../lib/expense-filters";
import type { ExpenseFilterKey } from "../../types/expense-filters";
import type { ExpenseFilterFieldsProps } from "../../types/expense-filter-props";
import {
  CURRENCY_FILTER_OPTIONS,
  SHARED_FILTER_OPTIONS,
  PANEL_FILTER_KEYS,
  PRIMARY_PANEL_FILTER_KEYS,
} from "../../constants/expense-filters";

export function ExpenseFilterFields({
  fields,
  value,
  onChange,
  statuses,
  personInPanel,
  panel,
  searchInPanel = false,
  personCounts,
  activeMarkers = false,
  showIcons = true,
  fullWidth = false,
  wrapAdditionalFilters = true,
  statusAllLabel = "Todos",
  sharedOwnLabel,
}: ExpenseFilterFieldsProps) {
  const categories = useCategories().data ?? [];
  const methods =
    usePaymentMethods().data?.filter((method) => method.isActive) ?? [];
  const set = (key: ExpenseFilterKey, next: string | undefined) =>
    onChange({ ...value, [key]: next || undefined });
  const width = panel || fullWidth ? "w-full" : undefined;

  const renderFields = (keys: readonly ExpenseFilterKey[]) => {
    const has = (key: ExpenseFilterKey) => keys.includes(key);
    return (
      <>
        {(has("month") || has("year")) && (
          <div className={panel ? "col-span-2" : undefined}>
            <PeriodFilterFields
              month={value.month}
              year={value.year}
              showMonth={has("month")}
              showYear={has("year")}
              onMonthChange={(next) => set("month", next)}
              onYearChange={(next) => set("year", next)}
            />
          </div>
        )}
        {personInPanel && has("person") && (
          <PersonFilterFields
            value={value.person}
            onChange={(next) => set("person", next)}
            width={width}
            counts={personCounts}
            activeMarker
            presentation={panel ? "popover" : "responsive-sheet"}
          />
        )}
        {has("category") && (
          <FilterSelect
            label="Categoría"
            icon={showIcons ? Tags : undefined}
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
            multiple={panel}
            labelClassName="text-sm font-medium"
            activeMarker={activeMarkers}
          />
        )}
        {has("method") && (
          <FilterSelect
            label="Medio de pago"
            icon={showIcons ? WalletCards : undefined}
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
            activeMarker={activeMarkers}
          />
        )}
        {has("currency") && (
          <FilterSelect
            label="Moneda"
            icon={showIcons ? Coins : undefined}
            value={value.currency}
            options={CURRENCY_FILTER_OPTIONS}
            onChange={(next) => set("currency", next)}
            width={width}
            searchable={panel}
            labelClassName="text-sm font-medium"
            activeMarker={activeMarkers}
          />
        )}
        {has("status") && (
          <StatusFilterFields
            icon={showIcons ? CircleCheck : undefined}
            statuses={statuses}
            value={value.status}
            onChange={(next) => set("status", next)}
            allLabel={
              statusAllLabel === "Todos" ? "Todos los estados" : statusAllLabel
            }
            width={width}
            labelClassName="text-sm font-medium"
            activeMarker={activeMarkers}
          />
        )}
        {has("period") && (
          <FilterSelect
            label="Periodo"
            icon={showIcons ? CalendarClock : undefined}
            value={value.period}
            options={entriesOf(SUBSCRIPTION_PERIOD_LABELS)}
            onChange={(next) => set("period", next)}
            width={width}
            searchable={panel}
            labelClassName="text-sm font-medium"
            activeMarker={activeMarkers}
          />
        )}
        {has("type") && (
          <FilterSelect
            label="Tipo"
            icon={showIcons ? ListFilter : undefined}
            value={value.type}
            options={entriesOf(EXPENSE_TYPE_LABELS)}
            onChange={(next) => set("type", next)}
            width={width ?? "w-[130px]"}
            searchable={panel}
            labelClassName="text-sm font-medium"
            activeMarker={activeMarkers}
          />
        )}
        {has("shared") && (
          <FilterSelect
            label="Compartidos"
            icon={showIcons ? UsersRound : undefined}
            value={value.shared}
            options={SHARED_FILTER_OPTIONS.map((option) =>
              option.value === "no" && sharedOwnLabel
                ? { ...option, label: sharedOwnLabel }
                : option,
            )}
            onChange={(next) => set("shared", next)}
            width={width ?? "w-[180px]"}
            searchable={panel}
            labelClassName="text-sm font-medium"
            activeMarker={activeMarkers}
          />
        )}
        {(has("dueFrom") || has("dueTo")) && (
          <div
            className={
              panel
                ? "col-span-2 space-y-2 rounded-lg border p-3"
                : "space-y-2 rounded-lg border p-3"
            }
          >
            <div>
              <div className="text-sm font-medium">
                <FieldLabel icon={showIcons ? CalendarRange : undefined}>
                  Vencimiento
                </FieldLabel>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {has("dueFrom") && (
                <div className="space-y-1.5">
                  <div className="text-xs text-muted-foreground">Desde</div>
                  <DatePicker
                    ariaLabel="Fecha de vencimiento desde"
                    value={value.dueFrom}
                    active={!!value.dueFrom}
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
                    active={!!value.dueTo}
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
  };

  if (!panel) return renderFields(fields);

  const panelFields = fields.filter(
    (key) =>
      PANEL_FILTER_KEYS.includes(key) || (key === "person" && personInPanel),
  );
  const primary = panelFields.filter((key) =>
    PRIMARY_PANEL_FILTER_KEYS.includes(key),
  );
  const additional = panelFields.filter(
    (key) => !PRIMARY_PANEL_FILTER_KEYS.includes(key),
  );
  return (
    <div className="space-y-3">
      {primary.length > 0 && (
        <section aria-label="Filtros principales" className="space-y-2">
          {searchInPanel && fields.includes("q") && (
            <RecordSearchField
              label="Buscar"
              className="w-full"
              value={value.q ?? ""}
              active={!!value.q?.trim()}
              onChange={(next) => set("q", next)}
            />
          )}
          <div
            className={cn(
              "grid gap-3",
              fullWidth ? "grid-cols-1" : "grid-cols-2",
            )}
          >
            {renderFields(primary)}
          </div>
        </section>
      )}
      {additional.length > 0 &&
        (wrapAdditionalFilters ? (
          <MoreFilters
            activeCount={countActiveExpenseFilters(value, additional)}
            defaultOpen={panel}
          >
            <div className="grid grid-cols-2 gap-3">
              {renderFields(additional)}
            </div>
          </MoreFilters>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {renderFields(additional)}
          </div>
        ))}
    </div>
  );
}
