import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CreditCard, FileSpreadsheet, FileText, HandCoins, MessageCircle, MoreHorizontal, Plus, Search, Trash2, Wallet, X } from "lucide-react";

import { debtReportUrl, useDebts, useDeleteDebt } from "@/shared/api/hooks/debts";
import { useCreditCards } from "@/shared/api/hooks/catalogs";
import { withQuery } from "@/shared/api/query";
import type { Debt } from "@/shared/api/types";
import { EmptyState } from "@/shared/components/EmptyState";
import { DataView, useViewMode, ViewToggle, type Column, type ViewMode } from "@/shared/components/DataView";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Progress } from "@/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

import {
  applyDebtFilters,
  buildCollectMessage,
  DEBT_FILTER_KEYS,
  DEBT_STATE_LABELS,
  debtBadgeStatus,
  groupByPerson,
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

const TEXTS: Record<Direction, { total: string; empty: string; title: string }> = {
  owed_to_me: { total: "Por cobrar", empty: "Nadie te debe nada", title: "Cobros" },
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
        <div className="flex justify-end">
          <ReportLinks />
        </div>
        <PeopleSummary month={month} year={year} onPay={setPaying} />
        <DebtPaymentDialog debt={paying} onOpenChange={(open) => !open && setPaying(undefined)} />
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
      <DebtDialog open={dialogOpen} onOpenChange={setDialogOpen} direction={direction} />
      <DebtPaymentDialog debt={paying} onOpenChange={(open) => !open && setPaying(undefined)} />
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
  const defaults: DebtFilterValues = { month: String(month), year: String(year) };
  const [filters, setFilters] = useUrlFilters<DebtFilterValues>(DEBT_FILTER_KEYS, defaults);
  const [grouped, setGrouped] = useState(false);
  const [groupByCard, setGroupByCard] = useState(false);
  const [view, setView] = useViewMode("debts", "table");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [registering, setRegistering] = useState(false);

  const shown = applyDebtFilters(debts, filters, { month, year });
  const total = shown.reduce((sum, debt) => sum + debt.balance, 0);
  const paid = shown.reduce((sum, debt) => sum + debt.paidAmount, 0);
  const checked = shown.filter((debt) => selected.has(debt.id));
  const card = filters.card ? cards.find((item) => item.id === filters.card) : undefined;
  const panelMonth = filters.month && filters.month !== "until" ? Number(filters.month) : null;
  const texts = TEXTS[direction];
  const cardNames = new Map(cards.map((c) => [c.id, c.name]));
  const cardGroups = groupByCard ? groupByPaymentMethod(shown, cardNames) : null;

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{texts.total}</p>
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          <p className="text-xs text-muted-foreground">
            {shown.length} cuotas · pagado {formatCurrency(paid)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setRegistering(true)}>
            <Wallet className="mr-1 h-4 w-4" /> Registrar pago
          </Button>
          {actions}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <DebtFilters
          value={filters}
          onChange={(next) => (setFilters(next), setSelected(new Set()))}
          debts={debts}
          cards={cards}
          monthLabel={`${getMonthName(month)} ${year}`}
          shown={shown.length}
          year={year}
          defaults={defaults}
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={grouped} onCheckedChange={setGrouped} /> Resumen por persona
          </label>
          <ViewToggle value={view} onChange={setView} />
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={groupByCard} onCheckedChange={setGroupByCard} />
            <CreditCard className="h-3.5 w-3.5" /> Agrupar por tarjeta
          </label>
        </div>
      </div>

      {card && panelMonth && filters.year && (
        <CardCheckPanel cardId={card.id} cardName={card.name} month={panelMonth} year={Number(filters.year)} />
      )}

      <DebtBulkBar selected={checked} onDone={() => setSelected(new Set())} />

      {!debts.length ? (
        <EmptyState description={texts.empty} />
      ) : !shown.length ? (
        <EmptyState description="No hay cuotas con estos filtros" />
      ) : cardGroups ? (
        <div className="space-y-6">
          {cardGroups.map((group) => {
            const openDebts = group.debts.filter((debt) => debt.balance > 0);
            return (
              <section key={group.cardId ?? "__no_card__"} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <h3 className="font-semibold">
                    {group.cardName} · {formatCurrency(group.total)}
                  </h3>
                  {direction === "owed_to_me" && <CollectButton name={group.cardName} debts={openDebts} />}
                </div>
                <DebtGrid debts={group.debts} view={view} onPay={onPay} selected={selected} onSelectedChange={setSelected} />
              </section>
            );
          })}
        </div>
      ) : grouped ? (
        <div className="space-y-6">
          {groupByPerson(shown).map((group) => (
            <section key={group.personId} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <h3 className="font-semibold">
                  {group.name} · {formatCurrency(group.total)}
                </h3>
                {direction === "owed_to_me" && <CollectButton name={group.name} debts={group.debts.filter((debt) => debt.balance > 0)} />}
              </div>
              <DebtGrid debts={group.debts} view={view} onPay={onPay} selected={selected} onSelectedChange={setSelected} />
            </section>
          ))}
        </div>
      ) : (
        <DebtGrid debts={shown} view={view} onPay={onPay} selected={selected} onSelectedChange={setSelected} />
      )}

      <RegisterPaymentDialog open={registering} onOpenChange={setRegistering} debts={debts} period={{ month, year }} />
    </div>
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
  const people = [...new Map(debts.map((debt) => [debt.personId, debt.person.name])).entries()];
  const set = (key: keyof DebtFilterValues, next: string | undefined) => onChange({ ...value, [key]: next || undefined });
  const select = (key: keyof DebtFilterValues, label: string, options: [string, string][], width = "w-[150px]") => (
    <Select value={value[key] ?? ALL} onValueChange={(next) => set(key, next === ALL ? undefined : next)}>
      <SelectTrigger className={`h-9 ${width}`} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: todos</SelectItem>
        {options.map(([option, text]) => (
          <SelectItem key={option} value={option}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  const active = Object.entries(value).some(([key, current]) => current && current !== defaults[key as keyof DebtFilterValues]);
  const months = Array.from({ length: 12 }, (_, i) => [String(i + 1), getMonthName(i + 1)] as [string, string]);
  const years = [...new Set([year, ...debts.map((debt) => debt.paymentYear)])].sort((a, b) => b - a);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-56">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar concepto..." value={value.q ?? ""} onChange={(e) => set("q", e.target.value)} className="h-9 pl-9" />
      </div>
      {select("person", "Persona", people)}
      {select("state", "Estado", Object.entries(DEBT_STATE_LABELS), "w-[170px]")}
      {select("month", "Mes", [["until", `Hasta ${monthLabel}`], ...months], "w-[170px]")}
      {select("year", "Año", years.map((item) => [String(item), String(item)] as [string, string]), "w-[120px]")}
      {select("card", "Tarjeta", cards.map((item) => [item.id, item.name] as [string, string]))}
      {select("origin", "Origen", [
        ["shared", "Compartido"],
        ["loan", "Préstamo"],
      ])}
      {active && (
        <>
          <Button variant="ghost" size="sm" onClick={() => onChange(defaults)}>
            <X className="mr-1 h-3.5 w-3.5" /> Restablecer
          </Button>
          <span className="text-xs text-muted-foreground">
            {shown} de {debts.length}
          </span>
        </>
      )}
    </div>
  );
}

// 💬 Cobrar: copies the /cobrar message of the bot, ready to paste in WhatsApp
function CollectButton({ name, debts }: { name: string; debts: Debt[] }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildCollectMessage(name, debts));
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
}: {
  debts: Debt[];
  view: ViewMode;
  onPay: (debt: Debt) => void;
  selected: Set<string>;
  onSelectedChange: (selected: Set<string>) => void;
}) {
  const deleteDebt = useDeleteDebt();
  const [deleting, setDeleting] = useState<Debt | null>(null);
  const columns: Column<Debt>[] = [
    {
      key: "concept",
      header: "Concepto",
      role: "title",
      cell: (debt) => (
        <div>
          <span className="font-medium">
            {debt.description}
            {debt.installment && <Badge variant="outline" className="ml-2 text-xs">{debt.installment}</Badge>}
          </span>
          {debt.notes && <p className="text-xs italic text-muted-foreground">{debt.notes}</p>}
        </div>
      ),
    },
    {
      key: "balance",
      header: "Saldo",
      role: "amount",
      cell: (debt) => {
        const progress = debt.amount > 0 ? (debt.paidAmount / debt.amount) * 100 : 0;
        return (
          <div className="min-w-[140px] space-y-1">
            <span className="font-semibold tabular-nums">{formatCurrency(debt.balance)}</span>
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              Pagado {formatCurrency(debt.paidAmount)} de {formatCurrency(debt.amount)}
            </p>
          </div>
        );
      },
    },
    { key: "person", header: "Persona", cell: (debt) => <span className="text-sm">{debt.person.name}</span> },
    {
      key: "month",
      header: "Mes de pago",
      cell: (debt) => <span className="text-sm text-muted-foreground">{getMonthName(debt.paymentMonth)} {debt.paymentYear}</span>,
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
          {debt.balance > 0 && debt.timing === "upcoming" && <Badge variant="outline">{DEBT_TIMING_LABELS.upcoming}</Badge>}
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
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Acciones de ${debt.description}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => onPay(debt)} disabled={debt.balance <= 0}>
              <HandCoins /> Registrar pago
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(debt)}>
              <Trash2 /> Borrar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
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
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar «{deleting?.description}»?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && deleting.paidAmount > 0
                ? `Tiene ${formatCurrency(deleting.paidAmount)} pagados: se borran con ella. No se puede deshacer.`
                : "No se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && deleteDebt.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}>
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Resumen (D114): every debt with a balance grouped by person, and each person by month (me deben · debo · neto)
function PeopleSummary({ month, year, onPay }: { month: number; year: number; onPay: (debt: Debt) => void }) {
  const { data: debts = [], isLoading } = useDebts();
  const defaults: DebtFilterValues = { month: "until", year: String(year) };
  const [filters, setFilters] = useUrlFilters<DebtFilterValues>(DEBT_FILTER_KEYS, defaults);
  const cards = useCreditCards().data ?? [];
  const open = debts.filter((debt) => debt.balance > 0);
  const shown = applyDebtFilters(open, filters, { month, year });
  const groups = groupByPerson(shown);
  if (isLoading) return null;

  const byMonth = groups.flatMap((group) => {
    const months = new Map<number, { month: number; year: number; owed: number; owe: number }>();
    for (const debt of group.debts) {
      const key = debt.paymentYear * 12 + debt.paymentMonth;
      const row = months.get(key) ?? { month: debt.paymentMonth, year: debt.paymentYear, owed: 0, owe: 0 };
      if (debt.direction === "owed_to_me") row.owed += debt.balance;
      else row.owe += debt.balance;
      months.set(key, row);
    }
    return [...months.entries()].sort(([a], [b]) => a - b).map(([, row]) => ({ name: group.name, ...row }));
  });

  return (
    <div className="space-y-4">
      <DebtFilters value={filters} onChange={setFilters} debts={open} cards={cards} monthLabel={`${getMonthName(month)} ${year}`} shown={shown.length} year={year} defaults={defaults} />
      {!groups.length ? (
        <EmptyState description="No hay deudas con saldo para este período" />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const owed = group.debts.filter((debt) => debt.direction === "owed_to_me");
              const owe = group.debts.filter((debt) => debt.direction === "i_owe");
              const totalOwed = owed.reduce((sum, debt) => sum + debt.balance, 0);
              const totalOwe = owe.reduce((sum, debt) => sum + debt.balance, 0);
              return (
                <Card key={group.personId}>
                  <CardContent className="space-y-3 pt-5">
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Me debe {formatCurrency(totalOwed)} · Le debo {formatCurrency(totalOwe)}
                      </p>
                      <p className="text-sm font-semibold">Neto {formatCurrency(totalOwed - totalOwe)}</p>
                    </div>
                    <div className="max-h-60 space-y-2 overflow-y-auto border-t pt-2">
                      {group.debts.map((debt) => (
                        <div key={debt.id} className="flex items-center justify-between gap-2 text-sm">
                          <div className="min-w-0">
                            <p className="truncate">
                              {debt.description}
                              {debt.installment ? ` ${debt.installment}` : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {debt.direction === "owed_to_me" ? "Me debe" : "Le debo"} · {getMonthName(debt.paymentMonth)} {debt.paymentYear}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium tabular-nums">{formatCurrency(debt.balance)}</span>
                            <Button variant="ghost" size="icon" aria-label="Registrar pago" onClick={() => onPay(debt)}>
                              <HandCoins className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ReportLinks personId={group.personId} />
                      <CollectButton name={group.name} debts={owed} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

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
                    <TableCell className="text-right tabular-nums">{formatCurrency(row.owed)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(row.owe)}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatCurrency(row.owed - row.owe)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
