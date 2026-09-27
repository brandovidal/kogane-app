import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  Layers,
  Search,
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
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
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

const ALL = "__all__";
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
  showActiveSummary?: boolean;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  width = "w-[150px]",
  description,
}: {
  label: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string | undefined) => void;
  width?: string;
  description?: string;
}) {
  const select = (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(next === ALL ? undefined : next)}
    >
      <SelectTrigger className={`h-9 ${width}`} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Todos</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  return label ? (
    <div className="space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {select}
    </div>
  ) : (
    select
  );
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
      const select = (
        <Select
          value={value.person ?? PERSON_ALL}
          onValueChange={(next) => set("person", next)}
        >
          <SelectTrigger
            className={`h-9 ${width ?? "w-37.5"}`}
            aria-label="Persona"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ME}>Yo</SelectItem>
            <SelectItem value={PERSON_ALL}>Todos</SelectItem>
            {others.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      return (
        <div className="space-y-1.5">
          <div className="text-sm font-medium">Persona</div>
          {fieldDescriptions?.person && <p className="text-xs text-muted-foreground">{fieldDescriptions.person}</p>}
          {select}
        </div>
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
          }))}
          onChange={(next) => set("category", next)}
          width={width}
          description={fieldDescriptions?.category}
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
          description={fieldDescriptions?.method}
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
          description={fieldDescriptions?.currency}
        />
      )}
      {has("status") && (
        <FilterSelect
          label="Estado"
          value={value.status}
          options={entriesOf(PAYMENT_STATUS_LABELS, statuses)}
          onChange={(next) => set("status", next)}
          width={width}
          description={fieldDescriptions?.status}
        />
      )}
      {has("period") && (
        <FilterSelect
          label="Periodo"
          value={value.period}
          options={entriesOf(SUBSCRIPTION_PERIOD_LABELS)}
          onChange={(next) => set("period", next)}
          width={width}
          description={fieldDescriptions?.period}
        />
      )}
      {has("type") && (
        <FilterSelect
          label="Tipo"
          value={value.type}
          options={entriesOf(EXPENSE_TYPE_LABELS)}
          onChange={(next) => set("type", next)}
          width={width ?? "w-[130px]"}
          description={fieldDescriptions?.type}
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
          description={fieldDescriptions?.shared}
        />
      )}
    </>
  );

  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {has("q") && (
        <div className="relative w-full sm:w-56 sm:shrink-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={value.q ?? ""}
            onChange={(event) => set("q", event.target.value)}
            className="h-9 pl-9"
          />
        </div>
      )}
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
          />
        )}
        {panel ? (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Filtros
                {count > 0 && <Badge variant="secondary" className="ml-1">{count}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(24rem,calc(100vw-1rem))] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  {description ?? "Filtra los registros y conserva tus opciones en la dirección de la página."}
                  {countLabel && <span className="mt-1 block">{shown} de {total} {countLabel}</span>}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4">{controls}</div>
              <SheetFooter>
                <Button variant="outline" disabled={count === 0} onClick={() => onChange(personInPanel ? { q: value.q } : { person: value.person, q: value.q })}>
                  Limpiar filtros
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : controls}
        {groupByOptions && onGroupByChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={groupCount ? "secondary" : "outline"} size="sm" className="h-9">
                <Layers className="mr-1.5 h-3.5 w-3.5" /> Agrupar
                {groupCount > 0 && <Badge variant="secondary" className="ml-1">{groupCount}</Badge>}
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuCheckboxItem checked={!groupBy || groupBy === "none"} onCheckedChange={() => onGroupByChange("none")}>
                Sin agrupar
              </DropdownMenuCheckboxItem>
              {groupByOptions.map((option) => (
                <DropdownMenuCheckboxItem key={option.value} checked={groupBy === option.value} onCheckedChange={(checked) => onGroupByChange(checked ? option.value : "none")}>
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
            <span className="text-xs text-muted-foreground">{shown} de {total}</span>
          </>
        )}
      </div>
    </div>
  );
}
