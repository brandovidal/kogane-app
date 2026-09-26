import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ChevronRight,
  CreditCard,
  ChevronDown,
  Eye,
  FileSpreadsheet,
  FileText,
  HandCoins,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import {
  debtReportUrl,
  useDebts,
  useDeleteDebt,
  useBulkDebts,
  useCardChecks,
} from "@/shared/api/hooks/debts";
import type { DebtReportFilter } from "@/shared/api/hooks/debts";
import { useCreditCards, usePaymentMethods, usePeople } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/shared/api/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES, type Debt } from "@/shared/api/types";
import { EmptyState } from "@/shared/components/EmptyState";
import {
  DataView,
  useViewMode,
  ViewToggle,
  type Column,
  type ViewMode,
} from "@/shared/components/DataView";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { DEBT_TIMING_LABELS } from "@/shared/labels";
import { formatCurrency } from "@/shared/lib/currency";
import { paidAndOwn } from "@/shared/lib/shared-expense";
import { getMonthName } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Progress } from "@/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Switch } from "@/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";

import {
  applyDebtFilters,
  buildCollectSummaryMessage,
  DEBT_FILTER_KEYS,
  DEBT_STATE_LABELS,
  debtBadgeStatus,
  groupByPerson,
  groupByPersonAndType,
  groupByPaymentMethod,
  type DebtFilterValues,
} from "../debt-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { CardCheckPanel } from "./CardCheckPanel";
import { StatementMinimumCard } from "@/features/credit-cards/components/StatementMinimumCard";
import { DebtBulkBar } from "./DebtBulkBar";
import { DebtDialog } from "./DebtDialog";
import { DebtPaymentDialog } from "./DebtPaymentDialog";
import { RegisterPaymentDialog } from "./RegisterPaymentDialog";

type Direction = "owed_to_me" | "i_owe";
export type DebtsMode = "collect" | "owe" | "summary";
const ALL = "__all__";

const TEXTS: Record<
  Direction,
  { total: string; empty: string; title: string }
> = {
  owed_to_me: {
    total: "Por cobrar",
    empty: "Nadie te debe nada",
    title: "Cobros",
  },
  i_owe: { total: "Por pagar", empty: "No debes nada", title: "Deudas" },
};

// Cobros (me deben) · Deudas (debo) · Resumen (D111, D114): one page per mode, the month of the header by default
function DebtsPageView({ mode }: { mode: DebtsMode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paying, setPaying] = useState<Debt | undefined>();
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const direction: Direction = mode === "owe" ? "i_owe" : "owed_to_me";

  if (mode === "summary") {
    return (
      <div className="space-y-4">
        <PeopleSummary month={month} year={year} />
        <DebtPaymentDialog
          debt={paying}
          onOpenChange={(open) => !open && setPaying(undefined)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DebtList
        direction={direction}
        splitGroupingSheet={mode === "collect"}
        onPay={setPaying}
        actions={
          <>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Nueva
            </Button>
          </>
        }
      />
      <DebtDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        direction={direction}
      />
      <DebtPaymentDialog
        debt={paying}
        onOpenChange={(open) => !open && setPaying(undefined)}
      />
    </div>
  );
}

function DebtList({
  direction,
  splitGroupingSheet,
  onPay,
  actions,
}: {
  direction: Direction;
  splitGroupingSheet: boolean;
  onPay: (debt: Debt) => void;
  actions: React.ReactNode;
}) {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const { data: debts = [], isLoading } = useDebts({ direction });
  const cards = useCreditCards().data ?? [];
  const defaults: DebtFilterValues = {
    month: String(month),
    year: String(year),
  };
  const [filters, setFilters] = useUrlFilters<DebtFilterValues>(
    DEBT_FILTER_KEYS,
    defaults,
  );
  const [groupedByPerson, setGroupedByPerson] = useState(false);
  const [groupedByCard, setGroupedByCard] = useState(false);
  const [view, setView] = useViewMode("debts", "table");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [registering, setRegistering] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>();

  const shown = applyDebtFilters(debts, filters, { month, year });
  const total = shown.reduce((sum, debt) => sum + debt.balance, 0);
  const paid = shown.reduce((sum, debt) => sum + debt.paidAmount, 0);
  const checked = shown.filter((debt) => selected.has(debt.id));
  const card = filters.card
    ? cards.find((item) => item.id === filters.card)
    : undefined;
  const panelMonth =
    filters.month && filters.month !== "until" ? Number(filters.month) : null;
  const texts = TEXTS[direction];
  const cardNames = new Map(cards.map((c) => [c.id, c.name]));
  const personGroups = groupedByPerson ? groupByPerson(shown) : null;
  const cardGroups = groupedByCard
    ? groupByPaymentMethod(shown, cardNames)
    : null;
  const personTypeGroups =
    groupedByPerson && groupedByCard
      ? groupByPersonAndType(shown, cardNames)
      : null;

  if (isLoading) return null;

  return (
      <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{texts.total}</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
            <p className="text-xs text-muted-foreground">
              {shown.length} cuotas · pagado {formatCurrency(paid)}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex flex-wrap items-center gap-2">
            <DebtFilterSheet
              value={filters}
              onChange={(next) => (setFilters(next), setSelected(new Set()))}
              debts={debts}
              cards={cards}
              monthLabel={`${getMonthName(month)} ${year}`}
              shown={shown.length}
              year={year}
              defaults={defaults}
              description="Filtra por persona, estado, período, tarjeta u origen."
              resultLabel={direction === "owed_to_me" ? "cobros" : "deudas"}
            >
              {!splitGroupingSheet && (
              <div className="space-y-3 border-t pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Agrupar resultados</p>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span>Por persona</span>
                  <Switch checked={groupedByPerson} onCheckedChange={setGroupedByPerson} />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" /> Por tarjeta</span>
                  <Switch checked={groupedByCard} onCheckedChange={setGroupedByCard} />
                </label>
                <p className="text-xs text-muted-foreground">
                  {groupedByPerson && groupedByCard ? "Una tabla por persona; tarjetas y plataformas se despliegan dentro." : groupedByPerson ? "Los cobros se agrupan por persona." : groupedByCard ? "Los cobros se agrupan por tarjeta." : "Activa uno o ambos para organizar los cobros."}
                </p>
              </div>
              )}
            </DebtFilterSheet>
            {splitGroupingSheet && (
              <DebtGroupingSheet
                groupedByPerson={groupedByPerson}
                groupedByCard={groupedByCard}
                onPersonChange={setGroupedByPerson}
                onCardChange={setGroupedByCard}
              />
            )}
            {splitGroupingSheet && <span aria-hidden="true" className="hidden h-5 border-l sm:inline-block" />}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ReportLinks filter={{ direction, month, year }} />
              <Button size="sm" variant="outline" onClick={() => setRegistering(true)}>
                <Wallet className="mr-1 h-4 w-4" /> Registrar pago
              </Button>
            {actions}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <ActiveDebtFilterChips
            value={filters}
            onChange={(next) => (setFilters(next), setSelected(new Set()))}
            debts={debts}
            cards={cards}
            monthLabel={`${getMonthName(month)} ${year}`}
            defaults={defaults}
            grouping={splitGroupingSheet ? {
              byPerson: groupedByPerson,
              byCard: groupedByCard,
              onToggle: (key) => key === "person"
                ? setGroupedByPerson((current) => !current)
                : setGroupedByCard((current) => !current),
            } : undefined}
          />
          <div className="flex justify-end"><ViewToggle value={view} onChange={setView} /></div>
        </div>

        {card && panelMonth && filters.year && (
          <CardCheckPanel
            cardId={card.id}
            cardName={card.name}
            month={panelMonth}
            year={Number(filters.year)}
          />
        )}

        <DebtBulkBar selected={checked} onDone={() => setSelected(new Set())} />

        {!debts.length ? (
          <EmptyState description={texts.empty} />
        ) : !shown.length ? (
          <EmptyState description="No hay cuotas con estos filtros" />
        ) : personTypeGroups ? (
          <div className="space-y-2">
            {personGroups?.map((group) => (
              <CollapsibleDebtGroup
                key={group.personId}
                title={group.name}
                total={group.total}
                debts={group.debts}
                direction={direction}
                view={view}
                onPay={onPay}
                onEdit={setEditingDebt}
                selected={selected}
                onSelectedChange={setSelected}
                groupTypes
                cardNames={cardNames}
                collapsible={false}
              />
            ))}
          </div>
        ) : cardGroups ? (
          <div className="space-y-2">
            {cardGroups.map((group) => (
              <CollapsibleDebtGroup
                key={group.cardId ?? "__no_card__"}
                title={group.cardName}
                total={group.total}
                debts={group.debts}
                direction={direction}
                view={view}
                onPay={onPay}
                onEdit={setEditingDebt}
                selected={selected}
                onSelectedChange={setSelected}
                cardNames={cardNames}
              />
            ))}
          </div>
        ) : personGroups ? (
          <div className="space-y-2">
            {personGroups.map((group) => (
              <CollapsibleDebtGroup
                key={group.personId}
                title={group.name}
                total={group.total}
                debts={group.debts}
                direction={direction}
                view={view}
                onPay={onPay}
                onEdit={setEditingDebt}
                selected={selected}
                onSelectedChange={setSelected}
                cardNames={cardNames}
                collapsible={false}
              />
            ))}
          </div>
        ) : (
          <DebtGrid
            debts={shown}
            view={view}
            onPay={onPay}
            onEdit={setEditingDebt}
            selected={selected}
            onSelectedChange={setSelected}
          />
        )}

        <RegisterPaymentDialog
          open={registering}
          onOpenChange={setRegistering}
          debts={debts}
          period={{ month, year }}
        />
        <DebtDialog open={!!editingDebt} onOpenChange={(open) => !open && setEditingDebt(undefined)} direction={direction} debt={editingDebt} />
      </div>
  );
}

function CollapsibleDebtGroup({
  title,
  total,
  debts,
  direction,
  view,
  onPay,
  onEdit,
  selected,
  onSelectedChange,
  groupTypes = false,
  cardNames,
  collapsible = true,
}: {
  title: string;
  total: number;
  debts: Debt[];
  direction: Direction;
  view: ViewMode;
  onPay: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  selected: Set<string>;
  onSelectedChange: (selected: Set<string>) => void;
  groupTypes?: boolean;
  cardNames?: Map<string, string>;
  collapsible?: boolean;
}) {
  const content = (
      <div className="space-y-3 border-t p-3">
        <DebtGrid
          debts={debts}
          view={view}
          onPay={onPay}
          onEdit={onEdit}
          selected={selected}
          onSelectedChange={onSelectedChange}
          groupTypes={groupTypes && view === "table"}
          cardNames={cardNames}
        />
      </div>
  );
  const heading = (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
      <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {debts.length} {debts.length === 1 ? "cobro" : "cobros"}
      </span>
      <span className="shrink-0 font-semibold tabular-nums">{formatCurrency(total)}</span>
      {direction === "owed_to_me" && (
        <CollectButton
          name={title}
          debts={debts.filter((debt) => debt.balance > 0)}
          cardNames={cardNames ?? new Map()}
        />
      )}
    </div>
  );

  if (!collapsible) {
    return (
      <section className="rounded-md border bg-card">
        <div className="flex items-center gap-3 px-3 py-3">{heading}</div>
        {content}
      </section>
    );
  }

  return (
    <details className="group rounded-md border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3 [&::-webkit-details-marker]:hidden">
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
        {heading}
      </summary>
      {content}
    </details>
  );
}

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
    ...new Map(
      debts.map((debt) => [debt.personId, debt.person.name]),
    ).entries(),
  ];
  const set = (key: keyof DebtFilterValues, next: string | undefined) =>
    onChange({ ...value, [key]: next || undefined });
  const select = (
    key: keyof DebtFilterValues,
    label: string,
    options: [string, string][],
  ) => (
    <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <Select
        value={value[key] ?? ALL}
        onValueChange={(next) => set(key, next === ALL ? undefined : next)}
      >
        <SelectTrigger className="h-9 w-full" aria-label={label}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos</SelectItem>
          {options.map(([option, text]) => (
            <SelectItem key={option} value={option}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
  const active = extraActive || Object.entries(value).some(
    ([key, current]) =>
      current && current !== defaults[key as keyof DebtFilterValues],
  );
  const months = Array.from(
    { length: 12 },
    (_, i) => [String(i + 1), getMonthName(i + 1)] as [string, string],
  );
  const years = [
    ...new Set([year, ...debts.map((debt) => debt.paymentYear)]),
  ].sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Filtros</h2>
      <details open className="group rounded-md border px-3">
        <summary className="cursor-pointer list-none py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between">Filtros generales<ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" /></span>
        </summary>
        <div className="space-y-3 pb-3">
        <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
          <span>Buscar</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Concepto o persona"
              value={value.q ?? ""}
              onChange={(e) => set("q", e.target.value)}
              className="h-9 pl-9"
            />
          </div>
        </label>
        {select("person", "Persona", people)}
        {!hideDirection && select("direction", "Mostrar", [["owed_to_me", "Cobros (+)"], ["i_owe", "Deudas (−)"]])}
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
          onClick={() => { onChange(defaults); onResetExtra?.(); }}
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
  const monthName = value.month === "until"
    ? `Hasta ${monthLabel}`
    : value.month
      ? getMonthName(Number(value.month))
      : "";
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

function DebtFilterSheet({
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
  children?: React.ReactNode;
}) {
  const activeCount = getActiveDebtFilterChips(value, defaults, debts, cards, monthLabel, directionFilterEnabled).length + (extraActive ? 1 : 0);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="h-4 w-4" /> Filtros
          {activeCount > 0 && <Badge variant="secondary" className="ml-1">{activeCount}</Badge>}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(24rem,calc(100vw-1rem))] overflow-y-auto">
        <SheetHeader className="px-5 pt-6">
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
          <p className="text-xs text-muted-foreground">{shown} de {debts.length} {resultLabel ?? "registros"}</p>
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

function DebtGroupingSheet({
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
        <Button variant="outline" size="sm">
          Agrupar
          {activeCount > 0 && <Badge variant="secondary" className="ml-1">{activeCount}</Badge>}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(24rem,calc(100vw-1rem))] overflow-y-auto">
        <SheetHeader className="px-5 pt-6">
          <SheetTitle>Agrupar cobros</SheetTitle>
          <SheetDescription>Organiza los resultados por persona, por tarjeta o por ambos.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-5 pb-6">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Por persona</span>
            <Switch checked={groupedByPerson} onCheckedChange={onPersonChange} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" /> Por tarjeta</span>
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

function DebtMovementTypeSheet({
  showCollections,
  showDebts,
  onCollectionsChange,
  onDebtsChange,
  onReset,
}: {
  showCollections: boolean;
  showDebts: boolean;
  onCollectionsChange: (checked: boolean) => void;
  onDebtsChange: (checked: boolean) => void;
  onReset: () => void;
}) {
  const activeCount = Number(!showCollections) + Number(!showDebts);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Agrupar por tipo de movimiento">Agrupar{activeCount > 0 && <Badge variant="secondary" className="ml-1">{activeCount}</Badge>}</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(24rem,calc(100vw-1rem))] overflow-y-auto">
        <SheetHeader className="px-5 pt-6">
          <SheetTitle>Tipo de movimiento</SheetTitle>
          <SheetDescription>Elige si el resumen incluye cobros, deudas o ambos.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-5 pb-6">
          <label className="flex items-center justify-between gap-3 text-sm"><span>Cobros (+)</span><Switch checked={showCollections} onCheckedChange={onCollectionsChange} /></label>
          <label className="flex items-center justify-between gap-3 text-sm"><span>Deudas (−)</span><Switch checked={showDebts} onCheckedChange={onDebtsChange} /></label>
          <p className="text-xs text-muted-foreground">Activa ambos para ver el consolidado completo.</p>
          {activeCount > 0 && <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onReset}><X className="mr-1 h-3.5 w-3.5" /> Restablecer tipo de movimiento</Button>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ActiveDebtFilterChips({
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
  const chips = getActiveDebtFilterChips(value, defaults, debts, cards, monthLabel, directionFilterEnabled);
  const groupingChips = [
    ...(grouping?.byPerson ? [{ key: "person" as const, label: "Agrupar: Persona" }] : []),
    ...(grouping?.byCard ? [{ key: "card" as const, label: "Agrupar: Tarjeta" }] : []),
  ];
  const movementChip = grouping?.movement && !(grouping.movement.showCollections && grouping.movement.showDebts)
    ? [{ label: grouping.movement.showCollections ? "Tipo: Cobros (+)" : grouping.movement.showDebts ? "Tipo: Deudas (−)" : "Tipo: ninguno" }]
    : [];
  if (!chips.length && !groupingChips.length && !movementChip.length) return null;
  return (
    <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap py-0.5" aria-label="Filtros y agrupación activos">
      {chips.map(({ key, label }) => (
        <Button
          key={key}
          variant="secondary"
          size="xs"
          className="max-w-56"
          onClick={() => {
            onChange({
              ...value,
              [key]: key === "month" || key === "year" ? undefined : defaults[key],
            });
            if (key === "direction") onDirectionFilterClear?.();
          }}
          aria-label={`Quitar filtro ${label}`}
          title={label}
        >
          <span className="truncate">{label}</span><X />
        </Button>
      ))}
      {chips.length > 0 && groupingChips.length > 0 && <span aria-hidden="true" className="mx-1 h-5 border-l" />}
      {groupingChips.map(({ key, label }) => (
        <Button
          key={`group-${key}`}
          variant="outline"
          size="xs"
          className="max-w-56"
          onClick={() => grouping?.onToggle(key)}
          aria-label={`Quitar ${label.toLowerCase()}`}
          title={label}
        >
          <span className="truncate">{label}</span><X />
        </Button>
      ))}
      {movementChip.length > 0 && (
        <>
          {(chips.length > 0 || groupingChips.length > 0) && <span aria-hidden="true" className="mx-1 h-5 border-l" />}
          <Button variant="outline" size="xs" onClick={() => grouping?.movement?.onReset()} aria-label="Restablecer tipo de movimiento">
            <span className="truncate">{movementChip[0].label}</span><X />
          </Button>
        </>
      )}
    </div>
  );
}

// 💬 Cobrar: copies the /cobrar message of the bot, ready to paste in WhatsApp
function CollectButton({
  name,
  debts,
  cardNames,
  additionalCharges = [],
  summaryDebts,
  personalExpenses = [],
}: {
  name: string;
  debts: Debt[];
  cardNames: Map<string, string>;
  additionalCharges?: { description: string; amount: number; periodMonth: number; periodYear: number }[];
  summaryDebts?: Debt[];
  personalExpenses?: { description: string; amount: number; source: string }[];
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        buildCollectSummaryMessage(name, debts, cardNames, additionalCharges, summaryDebts ? { debts: summaryDebts, personalExpenses } : undefined),
      );
      toast.success(`Mensaje para ${name} copiado`);
    } catch {
      toast.error("No pude copiar el mensaje");
    }
  };
  if (!debts.length && !additionalCharges.length && !summaryDebts?.length && !personalExpenses.length) return null;
  return (
    <Button variant="outline" size="sm" onClick={(event) => { event.preventDefault(); event.stopPropagation(); void copy(); }}>
      <MessageCircle className="mr-1 h-4 w-4" /> Cobrar
    </Button>
  );
}

function DebtGrid({
  debts,
  view,
  onPay,
  onEdit,
  selected,
  onSelectedChange,
  groupTypes = false,
  cardNames = new Map(),
}: {
  debts: Debt[];
  view: ViewMode;
  onPay: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  selected: Set<string>;
  onSelectedChange: (selected: Set<string>) => void;
  groupTypes?: boolean;
  cardNames?: Map<string, string>;
}) {
  const deleteDebt = useDeleteDebt();
  const [deleting, setDeleting] = useState<Debt | null>(null);
  const [resetting, setResetting] = useState<Debt | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const columns: Column<Debt>[] = [
    {
      key: "concept",
      header: "Concepto",
      role: "title",
      cell: (debt) => (
        <div>
          <span className="font-medium">
            {debt.description}
            {debt.installment && (
              <Badge variant="outline" className="ml-2 text-xs">
                {debt.installment}
              </Badge>
            )}
          </span>
          {debt.notes && (
            <p className="text-xs italic text-muted-foreground">{debt.notes}</p>
          )}
        </div>
      ),
    },
    {
      key: "balance",
      header: "Saldo",
      role: "amount",
      cell: (debt) => {
        const progress =
          debt.amount > 0 ? (debt.paidAmount / debt.amount) * 100 : 0;
        return (
          <div className="min-w-[140px] space-y-1">
            <span className="font-semibold tabular-nums">
              {formatCurrency(debt.balance)}
            </span>
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              Pagado {formatCurrency(debt.paidAmount)} de{" "}
              {formatCurrency(debt.amount)}
            </p>
          </div>
        );
      },
    },
    {
      key: "person",
      header: "Persona",
      cell: (debt) => <span className="text-sm">{debt.person.name}</span>,
    },
    {
      key: "month",
      header: "Mes de pago",
      cell: (debt) => (
        <span className="text-sm text-muted-foreground">
          {getMonthName(debt.paymentMonth)} {debt.paymentYear}
        </span>
      ),
    },
    {
      key: "state",
      header: "Estado",
      cell: (debt) => (
        <span className="inline-flex items-center gap-1">
          <StatusBadge status={debtBadgeStatus(debt.status)} />
          {debt.balance > 0 && debt.timing === "late" && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" /> {DEBT_TIMING_LABELS.late}
            </Badge>
          )}
          {debt.balance > 0 && debt.timing === "upcoming" && (
            <Badge variant="outline">{DEBT_TIMING_LABELS.upcoming}</Badge>
          )}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[50px]",
      cell: (debt) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label={`Acciones de ${debt.description}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <a href={`/detalle-deuda?id=${encodeURIComponent(debt.id)}&from=${debt.direction === "owed_to_me" ? "cobros" : "deudas"}`}><Eye /> Ver detalle</a>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEdit(debt)}>
              <Pencil /> Editar datos
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onPay(debt)}
              disabled={debt.balance <= 0}
            >
              <HandCoins /> Registrar pago
            </DropdownMenuItem>
            {debt.status !== "pending" && (
              <DropdownMenuItem onSelect={() => setResetting(debt)}>
                <RotateCcw /> Corregir estado
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeleting(debt)}
            >
              <Trash2 /> Borrar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  if (groupTypes) {
    const groups = groupByPersonAndType(debts, cardNames);
    const ownDebts = groups.find((group) => group.type === "Deuda propia")?.debts ?? [];
    const summaries = groups.filter((group) => group.type !== "Deuda propia");
    const toggleGroup = (key: string) => setExpandedGroups((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    const toggleSelection = (items: Debt[], checked: boolean) => {
      const next = new Set(selected);
      items.forEach((item) => checked ? next.add(item.id) : next.delete(item.id));
      onSelectedChange(next);
    };
    const renderDebtRow = (debt: Debt) => (
      <TableRow key={debt.id} data-state={selected.has(debt.id) ? "selected" : undefined}>
        <TableCell><Checkbox aria-label={`Seleccionar ${debt.description}`} checked={selected.has(debt.id)} onCheckedChange={(checked) => toggleSelection([debt], checked === true)} /></TableCell>
        {columns.map((column) => <TableCell key={column.key} className={column.className}>{column.cell(debt)}</TableCell>)}
      </TableRow>
    );
    return (
      <>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-[36px]"><Checkbox aria-label="Seleccionar todas las deudas de la persona" checked={debts.length > 0 && debts.every((debt) => selected.has(debt.id)) ? true : debts.some((debt) => selected.has(debt.id)) ? "indeterminate" : false} onCheckedChange={(checked) => toggleSelection(debts, checked === true)} /></TableHead>
              {columns.map((column) => <TableHead key={column.key} className={column.className}>{column.role === "actions" ? "" : column.header}</TableHead>)}
            </TableRow></TableHeader>
            <TableBody>
              {ownDebts.map(renderDebtRow)}
              {summaries.map((group) => {
                const isPlatform = group.type === "Plataformas";
                const title = /cmr|falabella/i.test(group.type) ? "CMR (Falabella)" : isPlatform ? "Plataformas · Stream" : group.type;
                const expanded = expandedGroups.has(group.key);
                const allSelected = group.debts.every((debt) => selected.has(debt.id));
                const someSelected = group.debts.some((debt) => selected.has(debt.id));
                return <>
                  <TableRow key={`${group.key}:summary`} className="bg-muted/30">
                    <TableCell><Checkbox aria-label={`Seleccionar ${title}`} checked={allSelected ? true : someSelected ? "indeterminate" : false} onCheckedChange={(checked) => toggleSelection(group.debts, checked === true)} /></TableCell>
                    {columns.map((column) => <TableCell key={column.key} className={column.className}>
                      {column.role === "title" ? <button type="button" className="flex items-center gap-2 text-left font-medium" aria-expanded={expanded} onClick={() => toggleGroup(group.key)}><ChevronRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />{title}<Badge variant="outline" className="text-xs">{group.debts.length}</Badge></button>
                        : column.role === "amount" ? <div className="font-semibold tabular-nums">{formatCurrency(group.total)}<p className="text-xs font-normal text-muted-foreground">Saldo conjunto</p></div>
                          : column.role === "actions" ? null
                            : column.key === "person" ? <span className="text-sm">{group.name}</span>
                              : <span className="text-muted-foreground">—</span>}
                    </TableCell>)}
                  </TableRow>
                  {expanded && group.debts.map(renderDebtRow)}
                </>;
              })}
            </TableBody>
          </Table>
        </div>
        <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Borrar «{deleting?.description}»?</AlertDialogTitle><AlertDialogDescription>{deleting && deleting.paidAmount > 0 ? `Tiene ${formatCurrency(deleting.paidAmount)} pagados: se borran con ella. No se puede deshacer.` : "No se puede deshacer."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleting && deleteDebt.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}>Borrar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>
        <ResetDebtDialog debt={resetting} onClose={() => setResetting(null)} />
      </>
    );
  }
  return (
    <>
      <DataView
        items={debts}
        columns={columns}
        rowKey={(debt) => debt.id}
        view={view}
        selected={selected}
        onSelectedChange={onSelectedChange}
      />
      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Borrar «{deleting?.description}»?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && deleting.paidAmount > 0
                ? `Tiene ${formatCurrency(deleting.paidAmount)} pagados: se borran con ella. No se puede deshacer.`
                : "No se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleting &&
                deleteDebt.mutate(deleting.id, {
                  onSuccess: () => setDeleting(null),
                })
              }
            >
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ResetDebtDialog debt={resetting} onClose={() => setResetting(null)} />
    </>
  );
}

function ResetDebtDialog({ debt, onClose }: { debt: Debt | null; onClose: () => void }) {
  const resetDebt = useBulkDebts();
  return (
    <AlertDialog open={!!debt} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Volver «{debt?.description}» a No iniciado?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminarán los pagos registrados de esta cuota y el saldo volverá al total. Puedes registrar el pago correcto después.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={resetDebt.isPending}
            onClick={() => debt && resetDebt.mutate({ ids: [debt.id], action: "reset" }, { onSuccess: onClose })}
          >
            Volver a No iniciado
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Resumen (D114): every debt with a balance grouped by person, and each person by month (me deben · debo · neto)
function PeopleSummary({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const { data: debts = [], isLoading } = useDebts();
  const defaults: DebtFilterValues = { month: String(month), year: String(year) };
  const [filters, setFilters] = useUrlFilters<DebtFilterValues>(
    DEBT_FILTER_KEYS,
    defaults,
  );
  const [view, setView] = useViewMode("debt-summary", "cards");
  const [summaryView, setSummaryView] = useState("consolidated");
  const paymentMethods = (usePaymentMethods().data ?? []).filter((method) => method.isActive);
  const cardNames = new Map(paymentMethods.map((method) => [method.id, method.name]));
  const [showCollections, setShowCollections] = useState(true);
  const [showDebts, setShowDebts] = useState(true);
  const open = debts.filter((debt) => debt.balance > 0);
  const shown = applyDebtFilters(open, { ...filters, direction: undefined }, { month, year })
    .filter((debt) => debt.direction === "owed_to_me" ? showCollections : showDebts);
  const groups = groupByPerson(shown);
  const reportFilter: DebtReportFilter = {
    q: filters.q || undefined,
    person: filters.person || undefined,
    state: filters.state,
    month: filters.month === "until" ? month : filters.month ? Number(filters.month) : undefined,
    year: filters.year ? Number(filters.year) : undefined,
    until: filters.month === "until" || undefined,
    origin: filters.origin,
    card: filters.card,
  };
  const owedDebts = shown.filter((debt) => debt.direction === "owed_to_me");
  const debtsIOwe = shown.filter((debt) => debt.direction === "i_owe");
  const totalToCollectBase = owedDebts.reduce((sum, debt) => sum + debt.balance, 0);
  const selectedMonth = filters.month && filters.month !== "until" ? Number(filters.month) : month;
  const selectedYear = filters.year ? Number(filters.year) : year;
  const ownCardExpenses = useExpenses(EXPENSE_RESOURCES.creditCard, { month: selectedMonth, year: selectedYear }).data ?? [];
  const ownFixedCosts = useExpenses(EXPENSE_RESOURCES.fixedCost, { month: selectedMonth, year: selectedYear }).data ?? [];
  const ownSubscriptions = useExpenses(EXPENSE_RESOURCES.subscription, { month: selectedMonth, year: selectedYear }).data ?? [];
  const people = usePeople().data ?? [];
  const ownPerson = people.find((person) => person.isDefault);
  const creditCards = paymentMethods.filter((method) =>
    method.type === "credit_card" && (!filters.card || filters.card === method.id),
  );
  const statementChecks = useCardChecks(creditCards.map((card) => card.id), selectedMonth, selectedYear);
  const normalizeSearch = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const matchedStatementDebtIds = new Set<string>();
  const statementChargeAdjustments = statementChecks.flatMap(({ data: check }, index) => {
    if (!showCollections) return [];
    const card = creditCards[index];
    if (!card || !check?.statementId || !/cmr|falabella/i.test(card.name) || filters.state || filters.origin) return [];
    const normalizeCharge = (value: string) => normalizeSearch(value)
      .replace(/\b(compra|del estado de cuenta)\b/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    return check.statementRows.flatMap((row) => {
      const personId = row.personId ?? check.statementPersonId;
      if (!personId || personId === check.statementPersonId || row.result === "ignored") return [];
      if (filters.person && filters.person !== personId) return [];
      const personName = people.find((person) => person.id === personId)?.name ?? check.expensesByPerson.find((person) => person.personId === personId)?.name ?? "Persona";
      const description = row.label ?? row.description;
      if (filters.q && !normalizeSearch(`${card.name} ${description} ${personName}`).includes(normalizeSearch(filters.q))) return [];

      const target = normalizeCharge(description);
      const debt = (row.debtId ? debts.find((item) => item.id === row.debtId && !matchedStatementDebtIds.has(item.id)) : undefined) ?? debts.find((item) =>
        !matchedStatementDebtIds.has(item.id) &&
        item.direction === "owed_to_me" &&
        item.paymentMethodId === card.id &&
        item.personId === personId &&
        item.paymentMonth === selectedMonth &&
        item.paymentYear === selectedYear &&
        normalizeCharge(item.description) === target &&
        (!row.installment || !item.installment || row.installment === item.installment),
      );
      if (debt && (debt.paymentMethodId !== card.id || debt.personId !== personId)) return [];
      if (debt) matchedStatementDebtIds.add(debt.id);

      const amount = debt
        ? Math.max(0, debt.balance + row.amount - debt.amount) - debt.balance
        : row.amount;
      if (Math.abs(amount) < 0.005) return [];
      return [{
        key: `${card.id}:${row.id}`,
        personId,
        personName,
        cardId: card.id,
        cardName: card.name,
        description: debt ? `Ajuste estado: ${description}` : description,
        amount,
        periodMonth: selectedMonth,
        periodYear: selectedYear,
      }];
    });
  });
  const statementAdjustmentTotal = statementChargeAdjustments.reduce((sum, item) => sum + item.amount, 0);
  const totalToCollect = totalToCollectBase + statementAdjustmentTotal;
  const groupedPeople = [...groups];
  for (const adjustment of statementChargeAdjustments) {
    if (!groupedPeople.some((group) => group.personId === adjustment.personId)) {
      groupedPeople.push({ personId: adjustment.personId, name: adjustment.personName, total: 0, debts: [] });
    }
  }
  const sortedGroups = groupedPeople.sort((a, b) =>
    (b.total + statementChargeAdjustments.filter((item) => item.personId === b.personId).reduce((sum, item) => sum + item.amount, 0)) -
    (a.total + statementChargeAdjustments.filter((item) => item.personId === a.personId).reduce((sum, item) => sum + item.amount, 0)),
  );
  const personalExpenses = summaryView === "consolidated" && ownPerson && showDebts && !filters.state && !filters.origin && (!filters.person || filters.person === ownPerson.id)
    ? [
        ...ownCardExpenses
          .filter((expense) => expense.personId === ownPerson.id && ["not_started", "pending"].includes(expense.paymentStatus))
          .filter((expense) => !/cmr|falabella/i.test(expense.paymentMethodId ? cardNames.get(expense.paymentMethodId) ?? "" : ""))
          .filter((expense) => !filters.card || filters.card === expense.paymentMethodId)
          .filter((expense) => !filters.q || normalizeSearch(`${expense.description} ${expense.paymentMethodId ? cardNames.get(expense.paymentMethodId) ?? "" : ""} IO`).includes(normalizeSearch(filters.q)))
          .filter((expense) => !debts.some((debt) => debt.personId === ownPerson.id && debt.paymentMethodId === expense.paymentMethodId && debt.paymentMonth === selectedMonth && debt.paymentYear === selectedYear && normalizeSearch(debt.description) === normalizeSearch(expense.description) && Math.abs(debt.amount - (expense.amountInPen ?? expense.amount)) < 0.01))
          .map((expense) => ({ id: `card:${expense.id}`, personId: ownPerson.id, description: expense.description, amount: paidAndOwn(expense).own, source: cardNames.get(expense.paymentMethodId) ?? "Tarjeta", paymentMethodId: expense.paymentMethodId })),
        ...ownFixedCosts
          .filter((expense) => expense.personId === ownPerson.id && ["not_started", "pending"].includes(expense.paymentStatus))
          .filter((expense) => !filters.card || expense.paymentMethodId === filters.card)
          .filter((expense) => !filters.q || normalizeSearch(`${expense.description} costos fijos`).includes(normalizeSearch(filters.q)))
          .filter((expense) => !debts.some((debt) => debt.personId === ownPerson.id && debt.paymentMethodId === expense.paymentMethodId && debt.paymentMonth === selectedMonth && debt.paymentYear === selectedYear && normalizeSearch(debt.description) === normalizeSearch(expense.description) && Math.abs(debt.amount - (expense.amountInPen ?? expense.amount)) < 0.01))
          .map((expense) => ({ id: `fixed:${expense.id}`, personId: ownPerson.id, description: expense.description, amount: paidAndOwn(expense).own, source: "Costos fijos", paymentMethodId: expense.paymentMethodId })),
        ...ownSubscriptions
          .filter((expense) => expense.personId === ownPerson.id && ["not_started", "pending"].includes(expense.paymentStatus))
          .filter((expense) => !filters.card || expense.paymentMethodId === filters.card)
          .filter((expense) => !filters.q || normalizeSearch(`${expense.description} ${expense.kind === "platform" ? "plataformas" : "recurrentes"}`).includes(normalizeSearch(filters.q)))
          .filter((expense) => !debts.some((debt) => debt.personId === ownPerson.id && debt.paymentMethodId === expense.paymentMethodId && debt.paymentMonth === selectedMonth && debt.paymentYear === selectedYear && normalizeSearch(debt.description) === normalizeSearch(expense.description) && Math.abs(debt.amount - (expense.amountInPen ?? expense.amount)) < 0.01))
          .map((expense) => ({ id: `subscription:${expense.id}`, personId: ownPerson.id, description: expense.description, amount: paidAndOwn(expense).own, source: expense.kind === "platform" ? "Plataformas" : "Recurrentes", paymentMethodId: expense.paymentMethodId })),
      ].filter((expense) => expense.amount > 0)
    : [];
  const personalExpenseTotal = personalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalToPayBase = debtsIOwe.reduce((sum, debt) => sum + debt.balance, 0);
  const totalToPay = totalToPayBase + (summaryView === "consolidated" ? personalExpenseTotal : 0);
  const netTotal = totalToCollect - totalToPay;
  if (isLoading) return null;

  const visibleGroups = summaryView === "consolidated" ? sortedGroups : groupedPeople;
  if (ownPerson && personalExpenses.length && !visibleGroups.some((group) => group.personId === ownPerson.id)) {
    visibleGroups.push({ personId: ownPerson.id, name: ownPerson.name, total: 0, debts: [] });
  }
  const byMonth = visibleGroups.flatMap((group) => {
    const months = new Map<
      number,
      { month: number; year: number; owed: number; owe: number }
    >();
    for (const debt of group.debts) {
      const key = debt.paymentYear * 12 + debt.paymentMonth;
      const row = months.get(key) ?? {
        month: debt.paymentMonth,
        year: debt.paymentYear,
        owed: 0,
        owe: 0,
      };
      if (debt.direction === "owed_to_me") row.owed += debt.balance;
      else row.owe += debt.balance;
      months.set(key, row);
    }
    const rows = [...months.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, row]) => ({ name: group.name, ...row, concept: "" }));
    for (const adjustment of statementChargeAdjustments.filter((item) => item.personId === group.personId)) {
      rows.push({
        name: group.name,
        month: adjustment.periodMonth,
        year: adjustment.periodYear,
        owed: adjustment.amount,
        owe: 0,
        concept: `${adjustment.cardName} · ${adjustment.description}`,
      });
    }
    for (const expense of personalExpenses.filter((item) => item.personId === group.personId)) {
      rows.push({
        name: group.name,
        month: selectedMonth,
        year: selectedYear,
        owed: 0,
        owe: expense.amount,
        concept: `${expense.source} · ${expense.description}`,
      });
    }
    return rows;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <DebtFilterSheet
          value={filters}
          onChange={setFilters}
          debts={open}
          cards={paymentMethods}
          monthLabel={`${getMonthName(month)} ${year}`}
          shown={shown.length}
          year={year}
          defaults={defaults}
          description="Filtra el resumen por persona, estado, período, tarjeta u origen."
          resultLabel="cobros"
          hideDirection
        />
        <DebtMovementTypeSheet showCollections={showCollections} showDebts={showDebts} onCollectionsChange={setShowCollections} onDebtsChange={setShowDebts} onReset={() => { setShowCollections(true); setShowDebts(true); }} />
        <ReportLinks filter={reportFilter} />
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <ActiveDebtFilterChips
          value={filters}
          onChange={setFilters}
          debts={open}
          cards={paymentMethods}
          monthLabel={`${getMonthName(month)} ${year}`}
          defaults={defaults}
          directionFilterEnabled={false}
          grouping={{ byPerson: false, byCard: false, onToggle: () => {}, movement: { showCollections, showDebts, onReset: () => { setShowCollections(true); setShowDebts(true); } } }}
        />
        <div className="flex justify-end"><ViewToggle value={view} onChange={setView} /></div>
      </div>
      {showDebts && <div className="flex min-w-0 items-center gap-4 overflow-x-auto whitespace-nowrap rounded-md border border-violet-400/25 bg-violet-500/5 px-3 py-2 text-sm">
        {showCollections && <span><span className="text-muted-foreground">Cobros</span> <strong className="font-semibold tabular-nums text-amber-300">{formatCurrency(totalToCollect)}</strong></span>}
        <span><span className="text-muted-foreground">Lo que debo</span> <strong className="font-medium tabular-nums text-muted-foreground">{formatCurrency(totalToPay)}</strong></span>
        <span className="font-semibold text-violet-200">{netTotal > 0 ? "Por cobrar" : netTotal < 0 ? "Por pagar" : "Saldo"} {formatCurrency(Math.abs(netTotal))}</span>
      </div>}
      {(!groups.length && !creditCards.length) || (!showCollections && !showDebts) ? (
        <EmptyState description={!showCollections && !showDebts ? "Activa Cobros (+), Deudas (−) o ambos en los filtros." : "No hay deudas con saldo para este período"} />
      ) : (
        <Tabs value={summaryView} onValueChange={setSummaryView} className="w-full">
          <TabsList className="w-full justify-start sm:w-auto">
            <TabsTrigger value="consolidated">Consolidado</TabsTrigger>
            <TabsTrigger
              value="minimum"
              className="data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-200"
            >
              Tarjeta (pago mínimo)
            </TabsTrigger>
          </TabsList>
          <TabsContent value={summaryView} className="mt-4 space-y-3">
          {summaryView === "minimum" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Estados de cuenta y pagos mínimos de tus tarjetas.</p>
              {!showCollections ? (
                <Card><CardContent className="p-4 text-sm text-muted-foreground">El filtro está mostrando solo deudas. El pago mínimo corresponde a cobros del estado de cuenta; selecciona Cobros (+) para verlo.</CardContent></Card>
              ) : (
                <StatementMinimumEditor
                  cards={creditCards.filter((_, index) => Boolean(statementChecks[index]?.data?.statementId))}
                  isLoading={statementChecks.some((check) => check.isLoading)}
                  hasCreditCards={creditCards.length > 0}
                  month={selectedMonth}
                  year={selectedYear}
                />
              )}
            </div>
          ) : (
          <>
          {view === "cards" ? (
          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
            {visibleGroups.map((group) => {
              const owed = group.debts.filter(
                (debt) => debt.direction === "owed_to_me",
              );
              const owe = group.debts.filter(
                (debt) => debt.direction === "i_owe",
              );
              const totalOwed = owed.reduce(
                (sum, debt) => sum + debt.balance,
                0,
              );
              const statementAdjustmentsForPerson = statementChargeAdjustments.filter((item) => item.personId === group.personId);
              const statementAdjustmentForPerson = statementAdjustmentsForPerson.reduce((sum, item) => sum + item.amount, 0);
              const totalOwe = owe.reduce((sum, debt) => sum + debt.balance, 0);
              const personalExpensesForPerson = personalExpenses.filter((item) => item.personId === group.personId);
              const personalExpenseForPerson = personalExpensesForPerson.reduce((sum, item) => sum + item.amount, 0);
              const balanceForPerson = totalOwed + statementAdjustmentForPerson - totalOwe - personalExpenseForPerson;
              const balanceLabel = balanceForPerson > 0 ? "Por cobrar" : balanceForPerson < 0 ? "Por pagar" : "Saldo";
              const sourceGroups = new Map<
                string,
                { key: string; name: string; direction: Direction; debts: Debt[]; total: number; owed: number; owe: number; collapsible: boolean; adjustments: typeof statementAdjustmentsForPerson; personalExpenses: typeof personalExpenses }
              >();
              for (const debt of group.debts) {
                const description = debt.description.trim();
                const isPlatform = /\b(stream|streaming|plataforma|netflix|spotify|youtube|icloud|disney|hbo|max|prime video|apple tv|paramount|crunchyroll|deezer|tidal|mubi|google one|dropbox)\b/i.test(description);
                const isLoan = /pr[eé]stamo/i.test(description);
                const isIsilIoInstallment = /\bisil\b/i.test(description);
                const cardName = debt.paymentMethodId
                  ? cardNames.get(debt.paymentMethodId)
                  : undefined;
                const sourceName = cardName
                  ? (/cmr|falabella/i.test(cardName) ? "CMR (Falabella)" : cardName)
                  : isIsilIoInstallment
                    ? "IO"
                  : isPlatform
                    ? "Plataformas · Stream"
                    : isLoan
                      ? "Préstamo"
                      : description;
                const collapsible = Boolean(cardName) || isIsilIoInstallment || isPlatform || isLoan;
                const key = collapsible ? sourceName : debt.id;
                const sourceGroup = sourceGroups.get(key) ?? {
                  key,
                  name: sourceName,
                  direction: debt.direction,
                  debts: [],
                  total: 0,
                  owed: 0,
                  owe: 0,
                  collapsible,
                  adjustments: [],
                  personalExpenses: [],
                };
                sourceGroup.debts.push(debt);
                sourceGroup.total += debt.balance;
                if (debt.direction === "owed_to_me") sourceGroup.owed += debt.balance;
                else sourceGroup.owe += debt.balance;
                sourceGroups.set(key, sourceGroup);
              }
              for (const adjustment of statementAdjustmentsForPerson) {
                const sourceName = /cmr|falabella/i.test(adjustment.cardName) ? "CMR (Falabella)" : adjustment.cardName;
                const key = sourceName;
                const sourceGroup = sourceGroups.get(key) ?? {
                  key,
                  name: sourceName,
                  direction: "owed_to_me" as Direction,
                  debts: [],
                  total: 0,
                  owed: 0,
                  owe: 0,
                  collapsible: true,
                  adjustments: [],
                  personalExpenses: [],
                };
                sourceGroup.adjustments.push(adjustment);
                sourceGroup.total += adjustment.amount;
                sourceGroup.owed += adjustment.amount;
                sourceGroups.set(key, sourceGroup);
              }
              for (const expense of personalExpensesForPerson) {
                const key = expense.source;
                const sourceGroup = sourceGroups.get(key) ?? {
                  key,
                  name: expense.source,
                  direction: "i_owe" as Direction,
                  debts: [],
                  total: 0,
                  owed: 0,
                  owe: 0,
                  collapsible: true,
                  adjustments: [],
                  personalExpenses: [],
                };
                sourceGroup.personalExpenses ??= [];
                sourceGroup.personalExpenses.push(expense);
                sourceGroup.total += expense.amount;
                sourceGroup.owe += expense.amount;
                sourceGroup.collapsible = true;
                sourceGroups.set(key, sourceGroup);
              }
              const summaryGroups = [...sourceGroups.values()];
              const sourceSummaryLine = (sourceGroup: (typeof summaryGroups)[number], expandable = false) => (
                <div className="grid grid-cols-[minmax(0,1fr)_5rem_9rem] items-center gap-2 border-t pt-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2 truncate font-medium">
                    {expandable && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />}
                    {sourceGroup.name}
                  </span>
                  <span className="text-right text-xs text-muted-foreground">
                      {sourceGroup.debts.length + sourceGroup.adjustments.length + (sourceGroup.personalExpenses?.length ?? 0)} {sourceGroup.debts.length + sourceGroup.adjustments.length + (sourceGroup.personalExpenses?.length ?? 0) === 1 ? "registro" : "registros"}
                  </span>
                  <span className="flex flex-col items-end text-right text-xs tabular-nums">
                    {sourceGroup.owed > 0 && <span className="text-amber-300">+ {formatCurrency(sourceGroup.owed)}</span>}
                    {sourceGroup.owe > 0 && <span className="text-muted-foreground">− {formatCurrency(sourceGroup.owe)}</span>}
                  </span>
                </div>
              );
              return (
                <Card key={group.personId}>
                  <CardContent className="space-y-3 pt-5">
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {showCollections && <span className="text-muted-foreground">Me debe <strong className="font-medium text-amber-300">{formatCurrency(totalOwed + statementAdjustmentForPerson)}</strong></span>}
                        {showCollections && showDebts && " · "}
                        {showDebts && <span className="text-muted-foreground">Le debo <strong className="font-medium">{formatCurrency(totalOwe + personalExpenseForPerson)}</strong></span>}
                      </p>
                      <p className="text-sm font-semibold text-violet-200">
                        {balanceLabel} {formatCurrency(Math.abs(balanceForPerson))}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {summaryGroups.map((sourceGroup) => sourceGroup.collapsible ? (
                        <details key={sourceGroup.key} className="group border-t">
                          <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                            {sourceSummaryLine(sourceGroup, true)}
                          </summary>
                          <div className="mb-2 space-y-2 border-l pl-5">
                            {sourceGroup.debts.map((debt) => (
                              <div key={debt.id} className="flex items-center justify-between gap-2 text-sm">
                                <div className="min-w-0">
                                  <p className="truncate">{debt.description}{debt.installment ? ` ${debt.installment}` : ""}</p>
                                  <p className="text-xs text-muted-foreground">{getMonthName(debt.paymentMonth)} {debt.paymentYear}</p>
                                </div>
                                <span className="font-medium tabular-nums">{formatCurrency(debt.balance)}</span>
                              </div>
                            ))}
                            {sourceGroup.adjustments.map((adjustment) => (
                              <div key={adjustment.key} className="flex items-center justify-between gap-2 text-sm">
                                <div className="min-w-0"><p className="truncate">{adjustment.description}</p><p className="text-xs text-muted-foreground">Comparado con estado de cuenta · {getMonthName(adjustment.periodMonth)} {adjustment.periodYear}</p></div>
                                <span className={`font-medium tabular-nums ${adjustment.amount < 0 ? "text-emerald-300" : ""}`}>{adjustment.amount < 0 ? "−" : "+"}{formatCurrency(Math.abs(adjustment.amount))}</span>
                              </div>
                            ))}
                            {sourceGroup.personalExpenses?.map((expense) => (
                              <div key={expense.id} className="flex items-center justify-between gap-2 text-sm">
                                <p className="min-w-0 truncate">{expense.description}</p>
                                <span className="shrink-0 font-medium tabular-nums">{formatCurrency(expense.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      ) : (
                        <div key={sourceGroup.key}>{sourceSummaryLine(sourceGroup)}</div>
                      ))}
                      <div className="grid grid-cols-[minmax(0,1fr)_5rem_9rem] items-center gap-2 border-t-2 pt-2 text-sm font-semibold">
                        <span>{balanceLabel}</span>
                        <span className="text-right text-xs font-normal text-muted-foreground">
                          {group.debts.length + statementAdjustmentsForPerson.length + personalExpensesForPerson.length} {group.debts.length + statementAdjustmentsForPerson.length + personalExpensesForPerson.length === 1 ? "registro" : "registros"}
                        </span>
                        <span className="text-right font-bold tabular-nums text-violet-200">
                          {formatCurrency(Math.abs(balanceForPerson))}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ReportLinks personId={group.personId} filter={reportFilter} />
                      <CollectButton
                        name={group.name}
                        debts={owed}
                        cardNames={cardNames}
                        additionalCharges={statementAdjustmentsForPerson}
                        summaryDebts={group.debts}
                        personalExpenses={personalExpensesForPerson}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Mes / concepto</TableHead>
                  <TableHead className="text-right">Me debe</TableHead>
                  <TableHead className="text-right">Le debo</TableHead>
                  <TableHead className="text-right text-violet-200">Por cobrar / pagar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byMonth.map((row) => (
                  <TableRow key={`${row.name}-${row.year}-${row.month}-${row.concept}`}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.concept || `${getMonthName(row.month)} ${row.year}`}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-amber-300">
                      {formatCurrency(row.owed)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(row.owe)}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-violet-200">
                      {formatCurrency(row.owed - row.owe)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 bg-muted/20 font-semibold">
                  <TableCell>Total registros · {shown.length + (summaryView === "consolidated" ? personalExpenses.length : 0)}</TableCell>
                  <TableCell className="text-muted-foreground">Todos los periodos</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-amber-300">{formatCurrency(totalToCollect)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency(totalToPay)}</TableCell>
                  <TableCell className="text-right font-bold tabular-nums text-violet-200">
                    {formatCurrency(netTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          )}
          {showCollections && <div className="grid items-start gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {creditCards.map((card, index) => {
              const check = statementChecks[index]?.data;
              if (!check?.statementId || check.minimumDue == null) return null;
              const currentCharges = check.expensesByPerson.reduce((sum, person) => sum + person.amount, 0);
              const difference = currentCharges - check.minimumDue;
              const covered = difference >= -0.005;
              return (
                <Card key={`minimum-coverage-${card.id}`}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{card.name} · {getMonthName(selectedMonth)} {selectedYear}</h3>
                        <p className="text-xs text-muted-foreground">Cargos del estado asignados, incluidos intereses</p>
                      </div>
              <span className={`text-sm font-semibold ${covered ? "text-emerald-300" : "text-amber-300"}`}>
                        {covered ? "Mínimo cubierto" : "Falta para el mínimo"}
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="rounded-md bg-amber-500/10 p-2"><p className="text-xs text-muted-foreground">Pago mínimo</p><p className="font-semibold tabular-nums text-amber-300">{formatCurrency(check.minimumDue)}</p></div>
                      <div className="rounded-md bg-muted/40 p-2"><p className="text-xs text-muted-foreground">Cargos + intereses</p><p className="font-semibold tabular-nums">{formatCurrency(currentCharges)}</p></div>
                      <div className={`rounded-md p-2 ${covered ? "bg-emerald-500/10" : "bg-amber-500/10"}`}><p className="text-xs text-muted-foreground">{covered ? "Excedente" : "Por cubrir"}</p><p className={`font-semibold tabular-nums ${covered ? "text-emerald-300" : "text-amber-300"}`}>{formatCurrency(Math.abs(difference))}</p></div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {check.expensesByPerson.map((person) => <span key={person.personId}>{person.name} <strong className="text-foreground tabular-nums">{formatCurrency(person.amount)}</strong></span>)}
                    </div>
                    <p className="text-xs text-muted-foreground">La suma incluye los cargos e intereses de {card.name}. Se compara con el pago mínimo una sola vez y no se agrega a «Lo que debo».</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>}
          </>
          )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function StatementMinimumEditor({
  cards,
  isLoading,
  hasCreditCards,
  month,
  year,
}: {
  cards: { id: string; name: string }[];
  isLoading: boolean;
  hasCreditCards: boolean;
  month: number;
  year: number;
}) {
  return (
    <div className="grid items-start gap-3">
      {cards.map((card) => (
        <StatementMinimumCard
          key={card.id}
          paymentMethodId={card.id}
          cardName={card.name}
          month={month}
          year={year}
        />
      ))}
      {isLoading && cards.length === 0 && (
        <Card><CardContent className="p-4 text-sm text-muted-foreground">Buscando estados de cuenta…</CardContent></Card>
      )}
      {!isLoading && cards.length === 0 && (
        <Card><CardContent className="p-4 text-sm text-muted-foreground">
          {hasCreditCards
            ? <>No hay estados de cuenta de tarjetas para {getMonthName(month)} {year}. <a className="underline underline-offset-4" href="/reconocimiento">Cargar estado de cuenta</a></>
            : "No hay tarjetas de crédito incluidas en los filtros actuales."}
        </CardContent></Card>
      )}
    </div>
  );
}

function ReportLinks({
  personId,
  filter = {},
}: {
  personId?: string;
  filter?: DebtReportFilter;
}) {
  return (
    <div role="group" aria-label="Exportar" className="inline-flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            Exportar <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href={debtReportUrl("xlsx", personId, filter)} download>
              <FileSpreadsheet /> Exportar a Excel
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={debtReportUrl("pdf", personId, filter)} download>
              <FileText /> Exportar a PDF
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const DebtsPage = withQuery(DebtsPageView);
