import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ChevronRight,
  CreditCard,
  FileSpreadsheet,
  FileText,
  HandCoins,
  MessageCircle,
  MoreHorizontal,
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
} from "@/shared/api/hooks/debts";
import { useCreditCards } from "@/shared/api/hooks/catalogs";
import { withQuery } from "@/shared/api/query";
import type { Debt } from "@/shared/api/types";
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
import { CardCheckPanel } from "./CardCheckPanel";
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
        <PeopleSummary month={month} year={year} onPay={setPaying} />
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
        onPay={setPaying}
        actions={
          <>
            <ReportLinks filter={{ direction, month, year }} />
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
  onPay,
  actions,
}: {
  direction: Direction;
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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{texts.total}</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
            <p className="text-xs text-muted-foreground">
              {shown.length} cuotas · pagado {formatCurrency(paid)}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
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
            >
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
            </DebtFilterSheet>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRegistering(true)}
            >
              <Wallet className="mr-1 h-4 w-4" /> Registrar pago
            </Button>
            {actions}
          </div>
        </div>

        <div className="flex justify-end">
          <ViewToggle value={view} onChange={setView} />
        </div>
        <ActiveDebtFilterChips
          value={filters}
          onChange={(next) => (setFilters(next), setSelected(new Set()))}
          debts={debts}
          cards={cards}
          monthLabel={`${getMonthName(month)} ${year}`}
          defaults={defaults}
        />

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
  selected: Set<string>;
  onSelectedChange: (selected: Set<string>) => void;
  groupTypes?: boolean;
  cardNames?: Map<string, string>;
  collapsible?: boolean;
}) {
  const content = (
      <div className="space-y-3 border-t p-3">
        {direction === "owed_to_me" && (
          <div className="flex justify-end">
            <CollectButton
              name={title}
              debts={debts.filter((debt) => debt.balance > 0)}
              cardNames={cardNames ?? new Map()}
            />
          </div>
        )}
        <DebtGrid
          debts={debts}
          view={view}
          onPay={onPay}
          selected={selected}
          onSelectedChange={onSelectedChange}
          groupTypes={groupTypes && view === "table"}
          cardNames={cardNames}
        />
      </div>
  );
  const heading = (
    <>
      <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {debts.length} {debts.length === 1 ? "cobro" : "cobros"}
      </span>
      <span className="shrink-0 font-semibold tabular-nums">{formatCurrency(total)}</span>
    </>
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
  shown,
  year,
  defaults,
}: {
  value: DebtFilterValues;
  onChange: (value: DebtFilterValues) => void;
  debts: Debt[];
  cards: { id: string; name: string }[];
  monthLabel: string;
  shown: number;
  year: number;
  defaults: DebtFilterValues;
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
  const active = Object.entries(value).some(
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
      <div className="space-y-1">
        <h2 className="font-semibold">Filtros</h2>
        <p className="text-xs text-muted-foreground">
          {shown} de {debts.length} cobros
        </p>
      </div>
      <div className="space-y-3">
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
      {active && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => onChange(defaults)}
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
    state: value.state ? `Estado: ${DEBT_STATE_LABELS[value.state]}` : undefined,
    month: value.month ? `Mes: ${monthName}` : undefined,
    year: value.year ? `Año: ${value.year}` : undefined,
    card: value.card ? `Tarjeta: ${cardNames.get(value.card) ?? value.card}` : undefined,
    origin: value.origin ? `Origen: ${value.origin === "shared" ? "Compartido" : "Préstamo"}` : undefined,
  };
  return (Object.keys(labels) as (keyof DebtFilterValues)[])
    .filter((key) => value[key] && value[key] !== defaults[key])
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
  children?: React.ReactNode;
}) {
  const activeCount = getActiveDebtFilterChips(value, defaults, debts, cards, monthLabel).length;
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
        </SheetHeader>
        <div className="space-y-5 overflow-y-auto px-5 pb-6">
          <DebtFilters
            value={value}
            onChange={onChange}
            debts={debts}
            cards={cards}
            monthLabel={monthLabel}
            shown={shown}
            year={year}
            defaults={defaults}
          />
          {children}
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
}: {
  value: DebtFilterValues;
  onChange: (value: DebtFilterValues) => void;
  debts: Debt[];
  cards: { id: string; name: string }[];
  monthLabel: string;
  defaults: DebtFilterValues;
}) {
  const chips = getActiveDebtFilterChips(value, defaults, debts, cards, monthLabel);
  if (!chips.length) return null;
  return (
    <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap py-0.5" aria-label="Filtros activos">
      {chips.map(({ key, label }) => (
        <Button
          key={key}
          variant="secondary"
          size="xs"
          className="max-w-56"
          onClick={() => onChange({ ...value, [key]: defaults[key] })}
          aria-label={`Quitar filtro ${label}`}
          title={label}
        >
          <span className="truncate">{label}</span><X />
        </Button>
      ))}
    </div>
  );
}

// 💬 Cobrar: copies the /cobrar message of the bot, ready to paste in WhatsApp
function CollectButton({
  name,
  debts,
  cardNames,
}: {
  name: string;
  debts: Debt[];
  cardNames: Map<string, string>;
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        buildCollectSummaryMessage(name, debts, cardNames),
      );
      toast.success(`Mensaje para ${name} copiado`);
    } catch {
      toast.error("No pude copiar el mensaje");
    }
  };
  if (!debts.length) return null;
  return (
    <Button variant="outline" size="sm" onClick={copy}>
      <MessageCircle className="mr-1 h-4 w-4" /> Cobrar
    </Button>
  );
}

function DebtGrid({
  debts,
  view,
  onPay,
  selected,
  onSelectedChange,
  groupTypes = false,
  cardNames = new Map(),
}: {
  debts: Debt[];
  view: ViewMode;
  onPay: (debt: Debt) => void;
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
  onPay,
}: {
  month: number;
  year: number;
  onPay: (debt: Debt) => void;
}) {
  const { data: debts = [], isLoading } = useDebts();
  const defaults: DebtFilterValues = { month: "until", year: String(year) };
  const [filters, setFilters] = useUrlFilters<DebtFilterValues>(
    DEBT_FILTER_KEYS,
    defaults,
  );
  const [view, setView] = useViewMode("debt-summary", "cards");
  const cards = useCreditCards().data ?? [];
  const cardNames = new Map(cards.map((card) => [card.id, card.name]));
  const open = debts.filter((debt) => debt.balance > 0);
  const shown = applyDebtFilters(open, filters, { month, year });
  const groups = groupByPerson(shown);
  if (isLoading) return null;

  const byMonth = groups.flatMap((group) => {
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
    return [...months.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, row]) => ({ name: group.name, ...row }));
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <DebtFilterSheet
          value={filters}
          onChange={setFilters}
          debts={open}
          cards={cards}
          monthLabel={`${getMonthName(month)} ${year}`}
          shown={shown.length}
          year={year}
          defaults={defaults}
          description="Filtra el resumen por persona, estado, período, tarjeta u origen."
        />
        <ReportLinks />
      </div>
      <div className="flex justify-end">
        <ViewToggle value={view} onChange={setView} />
      </div>
      <ActiveDebtFilterChips
        value={filters}
        onChange={setFilters}
        debts={open}
        cards={cards}
        monthLabel={`${getMonthName(month)} ${year}`}
        defaults={defaults}
      />
      {!groups.length ? (
        <EmptyState description="No hay deudas con saldo para este período" />
      ) : (
        <>
          {view === "cards" ? (
          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
            {groups.map((group) => {
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
              const totalOwe = owe.reduce((sum, debt) => sum + debt.balance, 0);
              const sourceGroups = new Map<
                string,
                { key: string; name: string; direction: Direction; debts: Debt[]; total: number }
              >();
              for (const debt of group.debts) {
                const description = debt.description.trim();
                const isPlatform = /\b(stream|streaming|plataforma|netflix|spotify|youtube|icloud|disney|hbo|max|prime video|apple tv|paramount|crunchyroll|deezer|tidal|mubi|google one|dropbox)\b/i.test(description);
                const cardName = debt.paymentMethodId
                  ? cardNames.get(debt.paymentMethodId)
                  : undefined;
                const sourceName = cardName
                  ? (/cmr|falabella/i.test(cardName) ? "CMR (Falabella)" : cardName)
                  : isPlatform
                    ? "Plataformas · Stream"
                    : /pr[eé]stamo/i.test(description)
                      ? "Préstamo"
                      : description;
                const key = `${sourceName}:${debt.direction}`;
                const sourceGroup = sourceGroups.get(key) ?? {
                  key,
                  name: sourceName,
                  direction: debt.direction,
                  debts: [],
                  total: 0,
                };
                sourceGroup.debts.push(debt);
                sourceGroup.total += debt.balance;
                sourceGroups.set(key, sourceGroup);
              }
              const summaryGroups = [...sourceGroups.values()];
              const renderDebt = (debt: Debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate">
                      {debt.description}
                      {debt.installment ? ` ${debt.installment}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {debt.direction === "owed_to_me" ? "Me debe" : "Le debo"}
                      {" · "}{getMonthName(debt.paymentMonth)} {debt.paymentYear}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium tabular-nums">
                      {formatCurrency(debt.balance)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Registrar pago: ${debt.description}`}
                      onClick={() => onPay(debt)}
                    >
                      <HandCoins className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
              return (
                <Card key={group.personId}>
                  <CardContent className="space-y-3 pt-5">
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Me debe {formatCurrency(totalOwed)} · Le debo{" "}
                        {formatCurrency(totalOwe)}
                      </p>
                      <p className="text-sm font-semibold">
                        Neto {formatCurrency(totalOwed - totalOwe)}
                      </p>
                    </div>
                    <div className="space-y-2 border-t pt-2">
                      {summaryGroups.map((sourceGroup) => (
                        <details key={sourceGroup.key} className="group border-t pt-2">
                          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm [&::-webkit-details-marker]:hidden">
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                            <span className="min-w-0 flex-1 truncate font-medium">
                              {sourceGroup.name} · {sourceGroup.direction === "owed_to_me" ? "Me debe" : "Le debo"}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {sourceGroup.debts.length} {sourceGroup.debts.length === 1 ? "registro" : "registros"}
                            </span>
                            <span className="shrink-0 font-semibold tabular-nums">{formatCurrency(sourceGroup.total)}</span>
                            <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                              <span className="group-open:hidden">Ver detalle</span>
                              <span className="hidden group-open:inline">Ocultar</span>
                            </span>
                          </summary>
                          <div className="mt-2 space-y-2 border-l pl-5">
                            {sourceGroup.debts.map(renderDebt)}
                          </div>
                        </details>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ReportLinks personId={group.personId} />
                      <CollectButton name={group.name} debts={owed} cardNames={cardNames} />
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
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">Me debe</TableHead>
                  <TableHead className="text-right">Le debo</TableHead>
                  <TableHead className="text-right">Neto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byMonth.map((row) => (
                  <TableRow key={`${row.name}-${row.year}-${row.month}`}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {getMonthName(row.month)} {row.year}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.owed)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.owe)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(row.owed - row.owe)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </>
      )}
    </div>
  );
}

// 📥 Excel · 📄 PDF (D39): the page on screen (direction and month), or one person
function ReportLinks({
  personId,
  filter = {},
}: {
  personId?: string;
  filter?: { direction?: Direction; month?: number; year?: number };
}) {
  return (
    <div className="flex items-center gap-1">
      <Button asChild variant="outline" size="sm">
        <a href={debtReportUrl("xlsx", personId, filter)} download>
          <FileSpreadsheet className="mr-1 h-4 w-4" /> Excel
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={debtReportUrl("pdf", personId, filter)} download>
          <FileText className="mr-1 h-4 w-4" /> PDF
        </a>
      </Button>
    </div>
  );
}

export const DebtsPage = withQuery(DebtsPageView);
