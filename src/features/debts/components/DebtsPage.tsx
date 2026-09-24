import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, FileSpreadsheet, FileText, HandCoins, MessageCircle, Plus, Search, Trash2, X } from "lucide-react";

import { debtReportUrl, useDebtSummary, useDebts, useDeleteDebt } from "@/shared/api/hooks/debts";
import { withQuery } from "@/shared/api/query";
import type { Debt } from "@/shared/api/types";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { DEBT_TIMING_LABELS } from "@/shared/labels";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";
import { PERSON_ALL, PERSON_ME, usePersonFilter } from "@/shared/stores/person.store";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import { Progress } from "@/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import {
  applyDebtFilters,
  buildCollectMessage,
  DEBT_FILTER_KEYS,
  DEBT_STATE_LABELS,
  groupByPerson,
  type DebtFilterValues,
} from "../debt-filters";
import { DebtDialog } from "./DebtDialog";
import { DebtPaymentDialog } from "./DebtPaymentDialog";

type Direction = "owed_to_me" | "i_owe";
const ALL = "__all__";

// The person of the header (D80): one person shows only theirs; Yo and Todos show everyone (you owe nobody yourself)
function useHeaderPerson(): string | undefined {
  const person = usePersonFilter((state) => state.person);
  return person === PERSON_ME || person === PERSON_ALL ? undefined : person;
}

// Préstamos y deudas (P17, D60, D80): Me deben · Debo · Por persona, with filters and grouping
function DebtsPageView() {
  const [tab, setTab] = useState<Direction | "people">("owed_to_me");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paying, setPaying] = useState<Debt | undefined>();
  const direction: Direction = tab === "i_owe" ? "i_owe" : "owed_to_me";
  const headerPerson = useHeaderPerson();

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="owed_to_me">Me deben</TabsTrigger>
            <TabsTrigger value="i_owe">Debo</TabsTrigger>
            <TabsTrigger value="people">Por persona</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <ReportLinks personId={headerPerson} />
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Nueva
            </Button>
          </div>
        </div>

        <TabsContent value="owed_to_me" className="mt-4">
          <DebtList direction="owed_to_me" headerPerson={headerPerson} onPay={setPaying} />
        </TabsContent>
        <TabsContent value="i_owe" className="mt-4">
          <DebtList direction="i_owe" headerPerson={headerPerson} onPay={setPaying} />
        </TabsContent>
        <TabsContent value="people" className="mt-4">
          <PeopleSummary headerPerson={headerPerson} />
        </TabsContent>
      </Tabs>

      <DebtDialog open={dialogOpen} onOpenChange={setDialogOpen} direction={direction} />
      <DebtPaymentDialog debt={paying} onOpenChange={(open) => !open && setPaying(undefined)} />
    </div>
  );
}

function DebtList({
  direction,
  headerPerson,
  onPay,
}: {
  direction: Direction;
  headerPerson?: string;
  onPay: (debt: Debt) => void;
}) {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const { data: debts = [], isLoading } = useDebts({ direction, ...(headerPerson ? { personId: headerPerson } : {}) });
  const [filters, setFilters] = useUrlFilters<DebtFilterValues>(DEBT_FILTER_KEYS);
  const [grouped, setGrouped] = useState(false);

  const open = debts.filter((debt) => debt.balance > 0);
  const shown = applyDebtFilters(open, filters, { month, year });
  const total = shown.reduce((sum, debt) => sum + debt.balance, 0);

  if (isLoading) return null;
  if (!open.length) {
    return <EmptyState description={direction === "owed_to_me" ? "Nadie te debe nada" : "No debes nada"} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{direction === "owed_to_me" ? "Por cobrar" : "Por pagar"}</p>
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={grouped} onCheckedChange={setGrouped} /> Agrupar por persona
        </label>
      </div>

      <DebtFilters
        value={filters}
        onChange={setFilters}
        debts={open}
        monthLabel={`${getMonthName(month)} ${year}`}
        shown={shown.length}
      />

      {!shown.length ? (
        <EmptyState description="No hay deudas con estos filtros" />
      ) : grouped ? (
        <div className="space-y-6">
          {groupByPerson(shown).map((group) => (
            <section key={group.personId} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <h3 className="font-semibold">
                  {group.name} · {formatCurrency(group.total)}
                </h3>
                {direction === "owed_to_me" && <CollectButton name={group.name} debts={group.debts} />}
              </div>
              <DebtGrid debts={group.debts} onPay={onPay} />
            </section>
          ))}
        </div>
      ) : (
        <DebtGrid debts={shown} onPay={onPay} />
      )}
    </div>
  );
}

function DebtFilters({
  value,
  onChange,
  debts,
  monthLabel,
  shown,
}: {
  value: DebtFilterValues;
  onChange: (value: DebtFilterValues) => void;
  debts: Debt[];
  monthLabel: string;
  shown: number;
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
  const active = Object.values(value).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-56">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar concepto..." value={value.q ?? ""} onChange={(e) => set("q", e.target.value)} className="h-9 pl-9" />
      </div>
      {select("person", "Persona", people)}
      {select("state", "Estado", Object.entries(DEBT_STATE_LABELS))}
      {select("month", "Mes", [
        ["only", `Solo ${monthLabel}`],
        ["until", `Hasta ${monthLabel}`],
      ], "w-[190px]")}
      {select("origin", "Origen", [
        ["shared", "Compartido"],
        ["loan", "Préstamo"],
      ])}
      {active && (
        <>
          <Button variant="ghost" size="sm" onClick={() => onChange({})}>
            <X className="mr-1 h-3.5 w-3.5" /> Limpiar
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
  return (
    <Button variant="outline" size="sm" onClick={copy}>
      <MessageCircle className="mr-1 h-4 w-4" /> Cobrar
    </Button>
  );
}

function DebtGrid({ debts, onPay }: { debts: Debt[]; onPay: (debt: Debt) => void }) {
  const deleteDebt = useDeleteDebt();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {debts.map((debt) => {
        const progress = debt.amount > 0 ? (debt.paidAmount / debt.amount) * 100 : 0;
        return (
          <Card key={debt.id}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">
                    {debt.description}
                    {debt.installment && <Badge variant="outline" className="ml-2 text-xs">{debt.installment}</Badge>}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {debt.person.name} · {getMonthName(debt.paymentMonth)} {debt.paymentYear}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => onPay(debt)} title="Registrar abono">
                    <HandCoins className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteDebt.mutate(debt.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={debt.status} />
                {debt.timing === "late" && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" /> {DEBT_TIMING_LABELS.late}
                  </Badge>
                )}
                {debt.timing === "upcoming" && <Badge variant="outline">{DEBT_TIMING_LABELS.upcoming}</Badge>}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Abonado: {formatCurrency(debt.paidAmount)}</span>
                  <span className="font-medium">{formatCurrency(debt.amount)}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">Saldo: {formatCurrency(debt.balance)}</p>
              </div>

              {debt.notes && <p className="text-xs italic text-muted-foreground">{debt.notes}</p>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PeopleSummary({ headerPerson }: { headerPerson?: string }) {
  const { data: rows = [], isLoading } = useDebtSummary();
  const { data: owed = [] } = useDebts({ direction: "owed_to_me" });
  const shown = headerPerson ? rows.filter((row) => row.personId === headerPerson) : rows;
  if (isLoading) return null;
  if (!shown.length) return <EmptyState description="No hay deudas pendientes" />;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map((row) => {
        const open = owed.filter((debt) => debt.personId === row.personId && debt.balance > 0);
        return (
          <Card key={row.personId}>
            <CardContent className="space-y-2 pt-6">
              <h3 className="font-medium">{row.name}</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Te debe</span>
                <span>{formatCurrency(row.owedToMe)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Le debes</span>
                <span>{formatCurrency(row.iOwe)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-semibold">
                <span>Neto</span>
                <span className={row.net >= 0 ? "text-green-600" : "text-red-500"}>{formatCurrency(row.net)}</span>
              </div>
              {row.late > 0 && <p className="text-xs text-red-500">⚠️ {formatCurrency(row.late)} vencido</p>}
              <div className="flex flex-wrap gap-2 pt-1">
                <ReportLinks personId={row.personId} />
                {open.length > 0 && <CollectButton name={row.name} debts={open} />}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// 📥 Excel · 📄 PDF (D39): everyone from the header, one person from their card or the header filter
function ReportLinks({ personId }: { personId?: string }) {
  return (
    <div className="flex items-center gap-1">
      <Button asChild variant="outline" size="sm">
        <a href={debtReportUrl("xlsx", personId)} download>
          <FileSpreadsheet className="mr-1 h-4 w-4" /> Excel
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={debtReportUrl("pdf", personId)} download>
          <FileText className="mr-1 h-4 w-4" /> PDF
        </a>
      </Button>
    </div>
  );
}

export const DebtsPage = withQuery(DebtsPageView);
