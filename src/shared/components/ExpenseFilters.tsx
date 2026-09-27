import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  Layers,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  useCategories,
  usePaymentMethods,
  usePeople,
} from "@/shared/api/hooks/catalogs";
import {
  EXPENSE_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_PERIOD_LABELS,
} from "@/shared/labels";
import {
  hasActiveFilters,
  PERSON_ALL,
  usesPanel,
  type ExpenseFilterKey,
  type ExpenseFilterValues,
} from "@/shared/lib/expense-filters";
import { FilterSelect } from "@/shared/components/FilterSelect";
import { SearchField } from "@/shared/components/SearchField";
import { Button } from "@/ui/button";
import { RecordListToolbar } from "@/shared/components/RecordListToolbar";
import { CountedToolbarButton } from "@/shared/components/CountedToolbarButton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

const ME = "__me__";

interface ExpenseFiltersProps {
  fields: ExpenseFilterKey[];
  value: ExpenseFilterValues;
  onChange: (value: ExpenseFilterValues) => void;
  statuses?: string[]; // the payment statuses of that table
  shown: number;
  total: number;
  groupBy?: string;
  onGroupByChange?: (value: string) => void;
  groupByOptions?: { value: string; label: string }[];
  personInPanel?: boolean;
  description?: string;
  countLabel?: string;
  fieldDescriptions?: Partial<Record<ExpenseFilterKey, string>>;
  rightActions?: ReactNode;
  appliedFilters?: ReactNode;
  viewToggle?: ReactNode;
  showActiveSummary?: boolean;
}

const entriesOf = (labels: Record<string, string>, keys?: string[]) =>
  (keys ?? Object.keys(labels)).map((key) => ({
    value: key,
    label: labels[key] ?? key,
  }));

export function ExpenseFilters({
  fields,
  value,
  onChange,
  statuses,
  shown,
  total,
  groupBy,
  onGroupByChange,
  groupByOptions,
  personInPanel = false,
  description,
  countLabel,
  fieldDescriptions,
  rightActions,
  appliedFilters,
  viewToggle,
  showActiveSummary = true,
}: ExpenseFiltersProps) {
  const categories = useCategories().data ?? [];
  const methods =
    usePaymentMethods().data?.filter((method) => method.isActive) ?? [];
  const others =
    usePeople().data?.filter(
      (person) => person.isActive && !person.isDefault,
    ) ?? [];
  const [open, setOpen] = useState(false);
  const set = (key: ExpenseFilterKey, next: string | undefined) =>
    onChange({ ...value, [key]: next || undefined });
  const has = (key: ExpenseFilterKey) => fields.includes(key);
  const panel = usesPanel(fields);
  const count = fields.filter((key) => {
    const filterValue = value[key];
    if (filterValue == null || filterValue === "") return false;
    if (key === "q") return typeof filterValue === "string" && !!filterValue.trim();
    if (key === "person") return filterValue !== PERSON_ALL;
    return true;
  }).length;
  const groupCount = groupBy && groupBy !== "none" ? 1 : 0;
  const width = panel ? "w-full" : undefined;

  const personControl =
    has("person") &&
    (() => {
      return (
        <FilterSelect
          label="Persona"
          value={value.person ?? PERSON_ALL}
          options={[
            { value: ME, label: "Yo" },
            ...others.map((person) => ({ value: person.id, label: person.name })),
          ]}
          onChange={(next) => set("person", next)}
          width={width ?? "w-37.5"}
          allValue={PERSON_ALL}
          searchable={panel && personInPanel}
          description={fieldDescriptions?.person}
          labelClassName="text-sm font-medium"
        />
      );
    })();

  const controls = (
    <>
      {personInPanel && personControl}
      {has("category") && (
        <FilterSelect
          label="Categoría"
          value={value.category}
          options={categories.map((category) => ({
            value: category.id,
            label: category.name,
            icon: category.icon,
            color: category.color,
          }))}
          onChange={(next) => set("category", next)}
          width={width}
          searchable={panel}
          description={fieldDescriptions?.category}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("method") && (
        <FilterSelect
          label="Medio de pago"
          value={value.method}
          options={methods.map((method) => ({
            value: method.id,
            label: method.name,
          }))}
          onChange={(next) => set("method", next)}
          width={width}
          searchable={panel}
          description={fieldDescriptions?.method}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("currency") && (
        <FilterSelect
          label="Moneda"
          value={value.currency}
          options={[
            { value: "PEN", label: "Soles (PEN)" },
            { value: "USD", label: "Dólares (USD)" },
          ]}
          onChange={(next) => set("currency", next)}
          width={width}
          searchable={panel}
          description={fieldDescriptions?.currency}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("status") && (
        <FilterSelect
          label="Estado"
          value={value.status}
          options={entriesOf(PAYMENT_STATUS_LABELS, statuses)}
          onChange={(next) => set("status", next)}
          width={width}
          searchable={panel}
          description={fieldDescriptions?.status}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("period") && (
        <FilterSelect
          label="Periodo"
          value={value.period}
          options={entriesOf(SUBSCRIPTION_PERIOD_LABELS)}
          onChange={(next) => set("period", next)}
          width={width}
          searchable={panel}
          description={fieldDescriptions?.period}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("type") && (
        <FilterSelect
          label="Tipo"
          value={value.type}
          options={entriesOf(EXPENSE_TYPE_LABELS)}
          onChange={(next) => set("type", next)}
          width={width ?? "w-[130px]"}
          searchable={panel}
          description={fieldDescriptions?.type}
          labelClassName="text-sm font-medium"
        />
      )}
      {has("shared") && (
        <FilterSelect
          label="Compartidos"
          value={value.shared}
          options={[
            { value: "yes", label: "Compartidos" },
            { value: "no", label: "Solo míos" },
          ]}
          onChange={(next) => set("shared", next)}
          width={width ?? "w-[180px]"}
          searchable={panel}
          description={fieldDescriptions?.shared}
          labelClassName="text-sm font-medium"
        />
      )}
    </>
  );

  const search = has("q") && (
    <SearchField
      className="w-full sm:w-56 sm:shrink-0"
      placeholder="Buscar..."
      value={value.q ?? ""}
      onChange={(next) => set("q", next)}
    />
  );
  const actions = (
    <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
      {has("person") && !personInPanel && personControl}
      {has("installments") && (
        <FilterSelect
          label="Cuota"
          value={value.installments}
          options={[
            { value: "with", label: "Con cuota" },
            { value: "without", label: "Sin cuota" },
          ]}
          onChange={(next) => set("installments", next)}
          width="w-[145px]"
          labelClassName="text-sm font-medium"
        />
      )}
      {panel ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <CountedToolbarButton
              label="Filtros"
              icon={<SlidersHorizontal className="h-4 w-4" />}
              count={count}
            />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[min(24rem,calc(100vw-1rem))] overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>
                {description ??
                  "Filtra los registros y conserva tus opciones en la dirección de la página."}
                {countLabel && (
                  <span className="mt-1 block">
                    {shown} de {total} {countLabel}
                  </span>
                )}
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-4">{controls}</div>
            <SheetFooter>
              <Button
                variant="outline"
                disabled={count === 0}
                onClick={() =>
                  onChange(
                    personInPanel
                      ? { q: value.q }
                      : { person: value.person, q: value.q },
                  )
                }
              >
                Limpiar filtros
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        controls
      )}
      {groupByOptions && onGroupByChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <CountedToolbarButton
              label="Agrupar"
              icon={<Layers className="h-4 w-4" />}
              count={groupCount}
              trailingIcon={<ChevronDown className="h-3.5 w-3.5" />}
              variant={groupCount > 0 ? "secondary" : "outline"}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuCheckboxItem
              checked={!groupBy || groupBy === "none"}
              onCheckedChange={() => onGroupByChange("none")}
            >
              Sin agrupar
            </DropdownMenuCheckboxItem>
            {groupByOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={groupBy === option.value}
                onCheckedChange={(checked) =>
                  onGroupByChange(checked ? option.value : "none")
                }
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {rightActions}
      {showActiveSummary && hasActiveFilters(value) && (
        <>
          <Button variant="ghost" size="sm" onClick={() => onChange({})}>
            <X className="mr-1 h-3.5 w-3.5" /> Limpiar
          </Button>
          <span className="text-xs text-muted-foreground">
            {shown} de {total}
          </span>
        </>
      )}
    </div>
  );
  return (
    <RecordListToolbar
      primary={search}
      actions={actions}
      applied={appliedFilters}
      view={viewToggle}
    />
  );
}
