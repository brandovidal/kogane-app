import { Filter, Layers } from "lucide-react";
import { Button, buttonVariants } from "@/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { SearchField } from "@/shared/components/filters/SearchField";
import { PersonSelect } from "@/features/settings/components/PersonSelect";
import { cn } from "@/shared/utils/cn";
import { DESTINATION_LABELS } from "@/features/drafts/constants/destinations";
import {
  activeFilterCount,
  EMPTY_DRAFT_FILTERS,
  hasActiveFilters,
  ORIGIN_LABELS,
  type DraftFilters,
  type DraftGroupBy,
  type DraftOrigin,
  type DraftStateFilter,
} from "@/features/drafts/lib/draft-filters";

const ORIGINS: [DraftOrigin, string][] = [
  ["all", "Todos"],
  ["web", ORIGIN_LABELS.web],
  ["telegram", ORIGIN_LABELS.telegram],
];
const STATES: [DraftStateFilter, string][] = [
  ["all", "Todos"],
  ["ready", "Listos"],
  ["incomplete", "Incompletos"],
];
const GROUPS: [DraftGroupBy, string][] = [
  ["none", "Sin agrupar"],
  ["destination", "Destino"],
  ["person", "Persona"],
  ["origin", "Origen"],
];
const ALL = "__all__";

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-lg bg-muted p-0.5 text-xs"
    >
      {options.map(([key, text]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          onClick={() => onChange(key)}
          className={cn(
            "rounded-md px-2.5 py-1 font-medium transition-colors",
            value === key
              ? "bg-background shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

// Buscar · Filtros · Agrupar · Origen (boards B1/B2): se aplican a la pestaña activa
export function DraftToolbar({
  filters,
  onFiltersChange,
  groupBy,
  onGroupByChange,
  showState = true,
}: {
  filters: DraftFilters;
  onFiltersChange: (filters: DraftFilters) => void;
  groupBy: DraftGroupBy;
  onGroupByChange: (groupBy: DraftGroupBy) => void;
  showState?: boolean;
}) {
  const set = <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) =>
    onFiltersChange({ ...filters, [key]: value });
  const count = activeFilterCount(filters);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchField
        value={filters.q}
        onChange={(q) => set("q", q)}
        placeholder="Buscar"
        shortcut="/"
        className="w-full sm:w-64"
      />
      <Popover>
        <PopoverTrigger
          type="button"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5",
          )}
        >
          <Filter className="size-4" /> Filtros
          {count > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {count}
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 space-y-3">
          {showState && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Estado
              </p>
              <Segmented
                label="Estado"
                value={filters.state}
                options={STATES}
                onChange={(state) => set("state", state)}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Destino</p>
            <Select
              value={filters.destination ?? ALL}
              onValueChange={(value) =>
                set("destination", value === ALL ? null : value)
              }
            >
              <SelectTrigger aria-label="Destino">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos</SelectItem>
                {Object.entries(DESTINATION_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Persona</p>
            <PersonSelect
              allowEmpty
              value={filters.personId}
              onChange={(personId) => set("personId", personId)}
              placeholder="Todas"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasActiveFilters(filters)}
            onClick={() => onFiltersChange(EMPTY_DRAFT_FILTERS)}
          >
            Limpiar
          </Button>
        </PopoverContent>
      </Popover>
      <Select
        value={groupBy}
        onValueChange={(value) => onGroupByChange(value as DraftGroupBy)}
      >
        <SelectTrigger
          size="sm"
          aria-label="Agrupar"
          className="w-auto gap-1.5"
        >
          <Layers className="size-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {GROUPS.map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {key === "none" ? label : `Agrupar: ${label}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Segmented
        label="Origen"
        value={filters.origin}
        options={ORIGINS}
        onChange={(origin) => set("origin", origin)}
      />
    </div>
  );
}
