import type { ReactNode } from "react";
import {
  ChevronRight,
  CreditCard,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { debtReportUrl } from "@/shared/api/hooks/debts";
import type { DebtReportFilter } from "@/shared/api/hooks/debts";
import type { Debt } from "@/shared/api/types";
import {
  AppliedFilterChips,
  type AppliedFilterChip,
} from "@/shared/components/AppliedFilterChips";
import { CountedToolbarButton } from "@/shared/components/CountedToolbarButton";
import { ExportMenu } from "@/shared/components/ExportMenu";
import { FilterSelect } from "@/shared/components/FilterSelect";
import { SearchField } from "@/shared/components/SearchField";
import { getMonthName } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/sheet";
import { Switch } from "@/ui/switch";
import { DEBT_STATE_LABELS, type DebtFilterValues } from "../debt-filters";

function DebtFilters({
  value,
  onChange,
  debts,
  cards,
  monthLabel,
  year,
  defaults,
  hideDirection = false,
  extraActive = false,
  onResetExtra,
}: {
  value: DebtFilterValues;
  onChange: (value: DebtFilterValues) => void;
  debts: Debt[];
  cards: { id: string; name: string }[];
  monthLabel: string;
  year: number;
  defaults: DebtFilterValues;
  hideDirection?: boolean;
  extraActive?: boolean;
  onResetExtra?: () => void;
}) {
  const people = [
    ...new Map(debts.map((debt) => [debt.personId, debt.person.name])).entries(),
  ];
  const set = (key: keyof DebtFilterValues, next: string | undefined) =>
    onChange({ ...value, [key]: next || undefined });
  const select = (
    key: keyof DebtFilterValues,
    label: string,
    options: [string, string][],
  ) => (
    <FilterSelect
      key={key}
      label={label}
      value={value[key]}
      options={options.map(([option, text]) => ({ value: option, label: text }))}
      onChange={(next) => set(key, next)}
      width="w-full"
      searchable
    />
  );
  const active =
    extraActive ||
    Object.entries(value).some(
      ([key, current]) => current && current !== defaults[key as keyof DebtFilterValues],
    );
  const months = Array.from(
    { length: 12 },
    (_, index) => [String(index + 1), getMonthName(index + 1)] as [string, string],
  );
  const years = [
    ...new Set([year, ...debts.map((debt) => debt.paymentYear)]),
  ].sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      <details open className="group rounded-md border px-3">
        <summary className="cursor-pointer list-none py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between">
            Datos generales
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
          </span>
        </summary>
        <div className="space-y-3 pb-3">
          <SearchField
            label="Buscar"
            placeholder="Concepto o persona"
            value={value.q ?? ""}
            onChange={(next) => set("q", next)}
          />
          {select("person", "Persona", people)}
          {!hideDirection &&
            select("direction", "Mostrar", [
              ["owed_to_me", "Cobros (+)"],
              ["i_owe", "Deudas (−)"],
            ])}
          {select("state", "Estado", Object.entries(DEBT_STATE_LABELS))}
          {select("month", "Mes", [["until", `Hasta ${monthLabel}`], ...months])}
          {select(
            "year",
            "Año",
            years.map((item) => [String(item), String(item)] as [string, string]),
          )}
          {select(
            "card",
            "Tarjeta",
            cards.map((item) => [item.id, item.name] as [string, string]),
          )}
          {select("origin", "Origen", [
            ["shared", "Compartido"],
            ["loan", "Préstamo"],
          ])}
        </div>
      </details>
      {active && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            onChange(defaults);
            onResetExtra?.();
          }}
        >
          <X className="mr-1 h-3.5 w-3.5" /> Restablecer filtros
        </Button>
      )}
    </div>
  );
}

function getActiveDebtFilterChips(
  value: DebtFilterValues,
  defaults: DebtFilterValues,
  debts: Debt[],
  cards: { id: string; name: string }[],
  monthLabel: string,
  includeDirection = true,
) {
  const people = new Map(debts.map((debt) => [debt.personId, debt.person.name]));
  const cardNames = new Map(cards.map((card) => [card.id, card.name]));
  const monthName = value.month === "until" ? `Hasta ${monthLabel}` : value.month ? getMonthName(Number(value.month)) : "";
  const labels: Partial<Record<keyof DebtFilterValues, string>> = {
    q: value.q ? `Buscar: ${value.q}` : undefined,
    person: value.person ? `Persona: ${people.get(value.person) ?? value.person}` : undefined,
    direction: includeDirection && value.direction ? `Mostrar: ${value.direction === "owed_to_me" ? "Cobros (+)" : "Deudas (−)"}` : undefined,
    state: value.state ? `Estado: ${DEBT_STATE_LABELS[value.state]}` : undefined,
    month: value.month ? `Mes: ${monthName}` : undefined,
    year: value.year ? `Año: ${value.year}` : undefined,
    card: value.card ? `Tarjeta: ${cardNames.get(value.card) ?? value.card}` : undefined,
    origin: value.origin ? `Origen: ${value.origin === "shared" ? "Compartido" : "Préstamo"}` : undefined,
  };
  return (Object.keys(labels) as (keyof DebtFilterValues)[])
    .filter((key) => value[key] && (key === "month" || key === "year" || value[key] !== defaults[key]))
    .map((key) => ({ key, label: labels[key]! }));
}

export function DebtFilterSheet({
  value,
  onChange,
  debts,
  cards,
  monthLabel,
  shown,
  year,
  defaults,
  description,
  resultLabel,
  directionFilterEnabled = false,
  hideDirection = false,
  extraActive = false,
  onResetExtra,
  children,
}: {
  value: DebtFilterValues;
  onChange: (value: DebtFilterValues) => void;
  debts: Debt[];
  cards: { id: string; name: string }[];
  monthLabel: string;
  shown: number;
  year: number;
  defaults: DebtFilterValues;
  description: string;
  resultLabel?: string;
  directionFilterEnabled?: boolean;
  hideDirection?: boolean;
  extraActive?: boolean;
  onResetExtra?: () => void;
  children?: ReactNode;
}) {
  const activeCount =
    getActiveDebtFilterChips(
      value,
      defaults,
      debts,
      cards,
      monthLabel,
      directionFilterEnabled,
    ).length + Number(extraActive);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <CountedToolbarButton
          label="Filtros"
          icon={<SlidersHorizontal />}
          count={activeCount}
        />
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(24rem,calc(100vw-1rem))] overflow-y-auto">
        <SheetHeader className="px-5 pt-6">
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
          <p className="text-xs text-muted-foreground">
            {shown} de {debts.length} {resultLabel ?? "registros"}
          </p>
        </SheetHeader>
        <div className="space-y-5 overflow-y-auto px-5 pb-6">
          <DebtFilters
            value={value}
            onChange={onChange}
            debts={debts}
            cards={cards}
            monthLabel={monthLabel}
            year={year}
            defaults={defaults}
            hideDirection={hideDirection}
            extraActive={extraActive}
            onResetExtra={onResetExtra}
          />
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function DebtGroupingSheet({
  groupedByPerson,
  groupedByCard,
  onPersonChange,
  onCardChange,
}: {
  groupedByPerson: boolean;
  groupedByCard: boolean;
  onPersonChange: (checked: boolean) => void;
  onCardChange: (checked: boolean) => void;
}) {
  const activeCount = Number(groupedByPerson) + Number(groupedByCard);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <CountedToolbarButton label="Agrupar" count={activeCount} />
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(24rem,calc(100vw-1rem))] overflow-y-auto">
        <SheetHeader className="px-5 pt-6">
          <SheetTitle>Agrupar cobros</SheetTitle>
          <SheetDescription>
            Organiza los resultados por persona, por tarjeta o por ambos.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-5 pb-6">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Por persona</span>
            <Switch checked={groupedByPerson} onCheckedChange={onPersonChange} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" /> Por tarjeta
            </span>
            <Switch checked={groupedByCard} onCheckedChange={onCardChange} />
          </label>
          <p className="text-xs text-muted-foreground">
            {groupedByPerson && groupedByCard
              ? "Una tabla por persona; las tarjetas y plataformas se muestran dentro de cada grupo."
              : groupedByPerson
                ? "Los cobros se agrupan por persona."
                : groupedByCard
                  ? "Los cobros se agrupan por tarjeta."
                  : "Activa una o ambas opciones para organizar los cobros."}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ActiveDebtFilterChips({
  value,
  onChange,
  debts,
  cards,
  monthLabel,
  defaults,
  directionFilterEnabled = false,
  onDirectionFilterClear,
  grouping,
}: {
  value: DebtFilterValues;
  onChange: (value: DebtFilterValues) => void;
  debts: Debt[];
  cards: { id: string; name: string }[];
  monthLabel: string;
  defaults: DebtFilterValues;
  directionFilterEnabled?: boolean;
  onDirectionFilterClear?: () => void;
  grouping?: {
    byPerson: boolean;
    byCard: boolean;
    onToggle: (key: "person" | "card") => void;
    movement?: { showCollections: boolean; showDebts: boolean; onReset: () => void };
  };
}) {
  const chips = getActiveDebtFilterChips(
    value,
    defaults,
    debts,
    cards,
    monthLabel,
    directionFilterEnabled,
  );
  const groupingChips = [
    ...(grouping?.byPerson ? [{ key: "person" as const, label: "Agrupar: Persona" }] : []),
    ...(grouping?.byCard ? [{ key: "card" as const, label: "Agrupar: Tarjeta" }] : []),
  ];
  const movementChip =
    grouping?.movement &&
    !(grouping.movement.showCollections && grouping.movement.showDebts)
      ? [
          {
            label: grouping.movement.showCollections
              ? "Tipo: Cobros (+)"
              : grouping.movement.showDebts
                ? "Tipo: Deudas (−)"
                : "Tipo: ninguno",
          },
        ]
      : [];
  const items: AppliedFilterChip[] = [
    ...chips.map(({ key, label }) => ({
      key,
      label,
      kind: "filter" as const,
      onRemove: () => {
        onChange({ ...value, [key]: key === "month" || key === "year" ? undefined : defaults[key] });
        if (key === "direction") onDirectionFilterClear?.();
      },
    })),
    ...groupingChips.map(({ key, label }) => ({
      key: `group-${key}`,
      label,
      kind: "group" as const,
      onRemove: () => grouping?.onToggle(key),
    })),
    ...movementChip.map(({ label }, index) => ({
      key: `movement-${index}`,
      label,
      kind: "group" as const,
      onRemove: () => grouping?.movement?.onReset(),
    })),
  ];
  return <AppliedFilterChips items={items} ariaLabel="Filtros y agrupación activos" />;
}

export function DebtReportLinks({
  personId,
  filter = {},
}: {
  personId?: string;
  filter?: DebtReportFilter;
}) {
  return (
    <ExportMenu
      items={[
        {
          label: "Exportar a Excel",
          icon: <FileSpreadsheet />,
          href: debtReportUrl("xlsx", personId, filter),
          download: true,
        },
        {
          label: "Exportar a PDF",
          icon: <FileText />,
          href: debtReportUrl("pdf", personId, filter),
          download: true,
        },
      ]}
    />
  );
}
