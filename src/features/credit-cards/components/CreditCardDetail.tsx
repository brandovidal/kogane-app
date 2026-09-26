import { OwnPart } from "@/shared/components/OwnPart";
import { totalsOf } from "@/shared/lib/shared-expense";
import { nameById, useCreditCards, usePeople, useMe } from "@/shared/api/hooks/catalogs";
import { useDeleteExpense, useExpenses, useSaveExpense } from "@/shared/api/hooks/expenses";
import { useCardCheck } from "@/shared/api/hooks/debts";
import { useStatements } from "@/shared/api/hooks/statements";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES, type Attachment, type CreditCardExpense } from "@/shared/api/types";
import { useUploadAttachment } from "@/shared/api/hooks/commitments";
import { usePeriod } from "@/shared/stores/period.store";
import { formatCurrency } from "@/shared/lib/currency";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { EmptyState } from "@/shared/components/EmptyState";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { DataView, useViewMode, type Column } from "@/shared/components/DataView";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/ui/select";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, ArrowLeft, CircleDollarSign, LayoutGrid, Table2, Users, ChevronDown, HandCoins, CalendarDays, Clock3, FileText } from "lucide-react";
import { RowActions } from "@/shared/components/RowActions";
import { duplicateBody, nextMonthBody } from "@/shared/lib/expense-actions";
import { ExpenseEditDialog } from "@/features/expenses/components/ExpenseEditDialog";
import { formatDate, getMonthName } from "@/shared/lib/dates";
import { ATTACHMENT_KIND_LABELS, CREDIT_CARD_STATUSES, EXPENSE_TYPE_LABELS, PAYMENT_STATUS_LABELS } from "@/shared/labels";
import { ExpenseFilters } from "@/shared/components/ExpenseFilters";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { applyExpenseFilters, type ExpenseFilterKey, type ExpenseFilterValues } from "@/shared/lib/expense-filters";
import { useNewExpense } from "@/shared/stores/new-expense.store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { StatementMinimumCard } from "./StatementMinimumCard";
import { StatementTotalCard } from "./StatementTotalCard";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/ui/alert-dialog";
import { api, unwrap } from "@/shared/api/client";
import { expenseKeys } from "@/shared/api/hooks/expenses";
import { isPaidStatus } from "@/shared/lib/expense-actions";

const FILTERS: ExpenseFilterKey[] = ["person", "q", "category", "currency", "status", "installments", "type", "shared"];

interface CreditCardDetailProps {
  cardCode: string;
}

// The card is a payment method of type credit_card (D62); the URL uses its code (CMR, IO…) or its id
function CreditCardDetailView({ cardCode }: CreditCardDetailProps) {
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const { data: creditCards, isLoading } = useCreditCards();
  const expenses = useExpenses(EXPENSE_RESOURCES.creditCard, { month: selectedMonth, year: selectedYear }).data ?? [];
  const people = usePeople().data ?? [];
  const personName = nameById(people);
  const saveExpense = useSaveExpense(EXPENSE_RESOURCES.creditCard);
  const deleteExpense = useDeleteExpense(EXPENSE_RESOURCES.creditCard);
  const uploadAttachment = useUploadAttachment({ quiet: true });
  const queryClient = useQueryClient();
  const openNewExpense = useNewExpense((state) => state.openWith);
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(FILTERS);
  const me = useMe();
  const [view, setView] = useViewMode("card-detail", "table");
  const [currencyView, setCurrencyView] = useState(false);
  const [editing, setEditing] = useState<CreditCardExpense | undefined>();
  const [groupedByPerson, setGroupedByPerson] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(() => new Set());
  const [confirmPayment, setConfirmPayment] = useState(false);
  const [payingSelected, setPayingSelected] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofKind, setPaymentProofKind] = useState<Attachment["kind"]>("boleta");

  const card = creditCards?.find((c) => c.code === cardCode || c.id === cardCode);
  const cardCheck = useCardCheck(card ? { paymentMethodId: card.id, month: selectedMonth, year: selectedYear } : null).data;
  const statements = useStatements().data ?? [];
  if (isLoading) return null;
  if (!card) return <EmptyState title="Tarjeta no encontrada" />;

  const ofCard = expenses.filter((e) => e.paymentMethodId === card.id);
  const cardExpenses = applyExpenseFilters(ofCard, filters, me).sort((a, b) =>
    (b.processDate ?? "").localeCompare(a.processDate ?? ""),
  );
  const selectedPending = cardExpenses.filter((expense) => selectedExpenses.has(expense.id) && !isPaidStatus(expense.paymentStatus));
  const statement = statements.find((item) => item.id === cardCheck?.statementId);
  const monthlyByCurrency = new Map<string, number>();
  for (const expense of ofCard) {
    const currency = expense.currency || "PEN";
    monthlyByCurrency.set(currency, (monthlyByCurrency.get(currency) ?? 0) + expense.amount);
  }
  if (statement?.currency && !monthlyByCurrency.has(statement.currency)) monthlyByCurrency.set(statement.currency, 0);
  const currencySummary = [...monthlyByCurrency.entries()].sort(([a], [b]) => a.localeCompare(b));
  const registerSelectedPayment = async () => {
    if (!selectedPending.length) return;
    setPayingSelected(true);
    const results = await Promise.allSettled(selectedPending.map((expense) =>
      unwrap(api.PATCH("/v1/expenses/{resource}/{id}", {
        params: { path: { resource: EXPENSE_RESOURCES.creditCard, id: expense.id } },
        body: { paymentStatus: "paid" } as never,
      })),
    ));
    const completedExpenses = selectedPending.filter((_, index) => results[index]?.status === "fulfilled");
    const completed = completedExpenses.length;
    const failed = results.length - completed;
    let attached = 0;
    let attachmentFailed = 0;
    if (paymentProof && completedExpenses.length) {
      const files = await Promise.allSettled(completedExpenses.map((expense) =>
        uploadAttachment.mutateAsync({ file: paymentProof, refType: "expense", refId: expense.id, kind: paymentProofKind }),
      ));
      attached = files.filter((result) => result.status === "fulfilled").length;
      attachmentFailed = files.length - attached;
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: expenseKeys.resource(EXPENSE_RESOURCES.creditCard) }),
      queryClient.invalidateQueries({ queryKey: ["summary"] }),
      queryClient.invalidateQueries({ queryKey: ["statements"] }),
    ]);
    if (completed) toast.success(`${completed} ${completed === 1 ? "pago registrado" : "pagos registrados"}${paymentProof ? ` · comprobante adjuntado a ${attached} gasto(s)` : ""}`);
    if (failed) toast.error(`${failed} ${failed === 1 ? "gasto no pudo marcarse" : "gastos no pudieron marcarse"} como pagado`);
    if (attachmentFailed) toast.error(`No se pudo adjuntar el comprobante a ${attachmentFailed} gasto(s)`);
    setSelectedExpenses(new Set());
    setPaymentProof(null);
    setPaymentProofKind("boleta");
    setConfirmPayment(false);
    setPayingSelected(false);
  };

  const totals = totalsOf(cardExpenses);
  const currencyGroups = [...cardExpenses.reduce((groups, expense) => {
    const currency = expense.currency || "PEN";
    const group = groups.get(currency) ?? [];
    group.push(expense);
    groups.set(currency, group);
    return groups;
  }, new Map<string, CreditCardExpense[]>())]
    .map(([currency, items]) => ({
      currency,
      items,
      total: items.reduce((sum, expense) => sum + expense.amount, 0),
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
  const personMap = new Map(people.map((p) => [p.id, p.name]));
  const personGroups = groupedByPerson
    ? (() => {
        const groups = new Map<string, { personId: string; name: string; total: number; expenses: CreditCardExpense[] }>();
        for (const exp of cardExpenses) {
          const name = personMap.get(exp.personId) ?? "Sin persona";
          const group = groups.get(exp.personId) ?? { personId: exp.personId, name, total: 0, expenses: [] };
          group.total += exp.amount;
          group.expenses.push(exp);
          groups.set(exp.personId, group);
        }
        return [...groups.values()].sort((a, b) => b.total - a.total);
      })()
    : null;

  const columns: Column<CreditCardExpense>[] = [
    {
      key: "description",
      header: "Descripción",
      role: "title",
      cell: (exp) => (
        <div>
          <span className="font-medium">{exp.description}</span>
          {exp.installment && <Badge variant="outline" className="ml-2 text-xs">{exp.installment}</Badge>}
          {exp.notes && <p className="text-xs text-muted-foreground">{exp.notes}</p>}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      cell: (exp) => <CurrencyDisplay amount={exp.amount} currency={exp.currency} amountInPEN={exp.amountInPen} othersShare={exp.othersShare} />,
    },
    {
      key: "status",
      header: "Estado",
      cell: (exp) => (
        <Select value={exp.paymentStatus} onValueChange={(v) => saveExpense.mutate({ id: exp.id, body: { paymentStatus: v } })}>
          <SelectTrigger className="h-7 w-auto border-0 p-0">
            <StatusBadge status={exp.paymentStatus} />
          </SelectTrigger>
          <SelectContent>
            {CREDIT_CARD_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>{PAYMENT_STATUS_LABELS[status]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    { key: "person", header: "Persona", cell: (exp) => <span className="text-sm">{personName(exp.personId)}</span> },
    {
      key: "date",
      header: "Fecha",
      cell: (exp) => <span className="text-sm text-muted-foreground">{exp.processDate ? formatDate(exp.processDate) : "—"}</span>,
    },
    {
      key: "type",
      header: "Tipo",
      cell: (exp) => (
        <Badge variant={exp.expenseType === "essential" ? "default" : "secondary"} className="text-xs">
          {EXPENSE_TYPE_LABELS[exp.expenseType]}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[60px]",
      cell: (exp) => (
        <RowActions
          label={exp.description}
          files={{ refType: "expense", refId: exp.id }}
          history={{ entity: "exp_credit_card_expenses", id: exp.id }}
          onEdit={() => setEditing(exp)}
          onDuplicate={() => saveExpense.mutate({ body: duplicateBody(EXPENSE_RESOURCES.creditCard, exp) })}
          onNextMonth={() => saveExpense.mutate({ id: exp.id, body: nextMonthBody(exp) })}
          onDelete={() => deleteExpense.mutate(exp.id)}
          status={{
            value: exp.paymentStatus,
            options: CREDIT_CARD_STATUSES,
            onChange: (paymentStatus) => saveExpense.mutate({ id: exp.id, body: { paymentStatus } }),
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <a href="/tarjetas" aria-label="Volver a tarjetas">
          <Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="h-4 w-4" /></Button>
        </a>
        <div className="flex min-w-0 items-center justify-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: card.color ?? "#6B7280" }} />
          <h2 className="truncate text-center text-xl font-semibold sm:text-2xl">Pago de tarjeta · {card.name}</h2>
        </div>
        <span className="w-9" aria-hidden="true" />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className={`h-2.5 w-2.5 rounded-full ${statement ? "bg-emerald-500" : "bg-muted-foreground"}`} />
            {statement ? "Estado de cuenta cargado" : "Consumo registrado"}
            <span className="ml-auto text-xs">{getMonthName(selectedMonth)} {selectedYear}</span>
          </div>
          <div className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)] md:items-end">
            <div>
              <p className="text-sm text-muted-foreground">{statement ? "Pago total del estado" : "Total registrado del mes (en soles)"}</p>
              <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
                {formatCurrency(statement?.totalDue ?? totals.paid, statement?.currency ?? "PEN")}
              </p>
              {!statement && <OwnPart {...totals} />}
            </div>
            <div className="space-y-2 border-t pt-3 text-sm md:border-l md:border-t-0 md:pl-5 md:pt-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Consumo del mes</p>
              {currencySummary.length ? currencySummary.map(([currency, amount]) => (
                <div key={currency} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: currency === "USD" ? "#38bdf8" : card.color ?? "#818cf8" }} />{currency === "USD" ? "Consumo dólares" : currency === "PEN" ? "Consumo soles" : `Consumo ${currency}`}</span>
                  <strong className="tabular-nums">{formatCurrency(amount, currency)}</strong>
                </div>
              )) : <p className="text-muted-foreground">Sin consumos en este período</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <a href="/reconocimiento" className="flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-primary/10 px-4 py-4 text-center font-semibold text-foreground transition-colors hover:bg-primary/15">
        <FileText className="h-5 w-5" /> Ver estados de cuenta
      </a>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card><CardContent className="flex min-h-24 items-center justify-between gap-3 p-4">
          <div><p className="text-sm text-muted-foreground">Cierre de facturación</p><p className="mt-1 text-lg font-semibold">{statement?.periodEnd ? formatDate(statement.periodEnd) : card.billingCloseDay ? `Día ${card.billingCloseDay}` : "Sin fecha"}</p></div>
          <CalendarDays className="h-8 w-8 text-muted-foreground/35" />
        </CardContent></Card>
        <Card><CardContent className="flex min-h-24 items-center justify-between gap-3 p-4">
          <div><p className="text-sm text-muted-foreground">Último día de pago</p><p className="mt-1 text-lg font-semibold">{statement?.dueDate ? formatDate(statement.dueDate) : card.paymentDueDay ? `Día ${card.paymentDueDay}` : "Sin fecha"}</p></div>
          <Clock3 className="h-8 w-8 text-muted-foreground/35" />
        </CardContent></Card>
      </div>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Resumen de pago de <span className="text-primary">{getMonthName(selectedMonth).toLowerCase()}</span></h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {currencySummary.map(([currency, amount]) => {
            const minimumForCurrency = statement?.currency === currency ? statement.minimumDue : null;
            return (
              <Card key={currency} className="bg-primary/[0.04]">
                <CardContent className="grid grid-cols-2 gap-4 p-4 sm:p-5">
                  <div className="space-y-3 border-r pr-4">
                    <h4 className="font-semibold">{currency === "USD" ? "Dólares" : currency === "PEN" ? "Soles" : currency}</h4>
                    <div><p className="text-sm text-muted-foreground">Pago total mes</p><p className="mt-1 text-lg font-bold tabular-nums">{formatCurrency(amount, currency)}</p></div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Pago mínimo</h4>
                    <div><p className="text-sm text-muted-foreground">Del estado de cuenta</p><p className="mt-1 text-lg font-bold tabular-nums">{minimumForCurrency == null ? "—" : formatCurrency(minimumForCurrency, currency)}</p></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!currencySummary.length && <Card><CardContent className="p-4 text-sm text-muted-foreground">No hay movimientos registrados para este mes.</CardContent></Card>}
        </div>
      </section>

      <Tabs defaultValue="expenses" className="space-y-4">
      <TabsList>
        <TabsTrigger value="expenses">Gastos de la tarjeta</TabsTrigger>
        <TabsTrigger value="minimum">Pago mínimo</TabsTrigger>
        <TabsTrigger value="total">Pago total</TabsTrigger>
      </TabsList>
      <TabsContent value="expenses" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ExpenseFilters
          fields={FILTERS}
          value={filters}
          onChange={setFilters}
          statuses={CREDIT_CARD_STATUSES}
          shown={cardExpenses.length}
          total={ofCard.length}
        />
        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={groupedByPerson || currencyView ? "secondary" : "outline"} size="sm">
                Agrupar{groupedByPerson ? ": Persona" : currencyView ? ": Moneda" : ""}<ChevronDown className="ml-1 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuCheckboxItem checked={!groupedByPerson && !currencyView} onCheckedChange={() => { setGroupedByPerson(false); setCurrencyView(false); }}>
                Sin agrupar
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={groupedByPerson} onCheckedChange={(checked) => { setGroupedByPerson(checked); if (checked) setCurrencyView(false); }}>
                <Users className="h-4 w-4" /> Por persona
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={currencyView} onCheckedChange={(checked) => { setCurrencyView(checked); if (checked) setGroupedByPerson(false); }}>
                <CircleDollarSign className="h-4 w-4" /> Por moneda
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <Button variant={!currencyView && view === "table" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" aria-label="Vista de tabla" aria-pressed={!currencyView && view === "table"} onClick={() => { setView("table"); setCurrencyView(false); }}><Table2 className="h-4 w-4" /></Button>
            <Button variant={!currencyView && view === "cards" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" aria-label="Vista de tarjetas" aria-pressed={!currencyView && view === "cards"} onClick={() => { setView("cards"); setCurrencyView(false); }}><LayoutGrid className="h-4 w-4" /></Button>
          </div>
          <Button size="sm" onClick={() => openNewExpense({ destination: "credit_card", paymentMethodId: card.id })}>
            <Plus className="mr-1 h-4 w-4" /> Nuevo gasto
          </Button>
          <Button variant="outline" size="sm" disabled={selectedPending.length === 0} onClick={() => setConfirmPayment(true)}>
            <HandCoins className="mr-1 h-4 w-4" /> Registrar pago{selectedPending.length ? ` (${selectedPending.length})` : ""}
          </Button>
        </div>
      </div>

      {cardExpenses.length === 0 ? (
        <EmptyState
          description={ofCard.length ? "No hay gastos con estos filtros" : "No hay gastos registrados para esta tarjeta"}
        />
      ) : currencyView ? (
        <div className="space-y-4">
          {currencyGroups.map((group) => (
            <Card key={group.currency}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{group.currency === "PEN" ? "Soles (PEN)" : group.currency === "USD" ? "Dólares (USD)" : group.currency}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">{group.items.length} {group.items.length === 1 ? "gasto" : "gastos"}</p>
                  </div>
                  <strong className="text-right tabular-nums">{formatCurrency(group.total, group.currency)}</strong>
                </div>
              </CardHeader>
              <CardContent>
                <DataView items={group.items} columns={columns} rowKey={(exp) => exp.id} view="table" selected={selectedExpenses} onSelectedChange={setSelectedExpenses} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groupedByPerson ? (
        <div className="space-y-6">
          {personGroups?.map((group) => {
            const gTotal = group.expenses.reduce((sum, e) => sum + e.amount, 0);
            return (
              <section key={group.personId} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <h3 className="font-semibold">
                    {group.name} · {formatCurrency(gTotal)}
                  </h3>
                </div>
                <DataView items={group.expenses} columns={columns} rowKey={(exp) => exp.id} view={view} selected={selectedExpenses} onSelectedChange={setSelectedExpenses} />
              </section>
            );
          })}
        </div>
      ) : (
        <DataView items={cardExpenses} columns={columns} rowKey={(exp) => exp.id} view={view} selected={selectedExpenses} onSelectedChange={setSelectedExpenses} />
      )}
      </TabsContent>
      <TabsContent value="minimum" className="space-y-4">
        <p className="text-sm text-muted-foreground">Detalle del estado de cuenta {card.name}.</p>
        <StatementMinimumCard paymentMethodId={card.id} cardName={card.name} month={selectedMonth} year={selectedYear} />
      </TabsContent>
      <TabsContent value="total" className="space-y-4">
        <p className="text-sm text-muted-foreground">Consulta cuánto del total del estado está cubierto por los pagos registrados.</p>
        <StatementTotalCard paymentMethodId={card.id} cardName={card.name} month={selectedMonth} year={selectedYear} />
      </TabsContent>
      </Tabs>

      <ExpenseEditDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(undefined)}
        resource={EXPENSE_RESOURCES.creditCard}
        expense={editing}
      />

      <AlertDialog open={confirmPayment} onOpenChange={(open) => {
        setConfirmPayment(open);
        if (!open && !payingSelected) {
          setPaymentProof(null);
          setPaymentProofKind("boleta");
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar pago</AlertDialogTitle>
            <AlertDialogDescription>
              Se marcarán como pagados {selectedPending.length} {selectedPending.length === 1 ? "gasto seleccionado" : "gastos seleccionados"} de {card.name}. El comprobante es opcional.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label className="space-y-1.5 text-sm">
              <span>Tipo de comprobante</span>
              <Select value={paymentProofKind} onValueChange={(value) => setPaymentProofKind(value as Attachment["kind"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ATTACHMENT_KIND_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="block space-y-1.5 text-sm">
              <span>Boleta, captura o archivo</span>
              <Input
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0] ?? null;
                  event.currentTarget.value = "";
                  if (file && file.size > 15 * 1024 * 1024) {
                    setPaymentProof(null);
                    toast.error("El archivo no puede superar 15 MB");
                    return;
                  }
                  setPaymentProof(file);
                }}
              />
              <span className="block text-xs text-muted-foreground">
                {paymentProof ? `${paymentProof.name} · se adjuntará a cada gasto pagado` : "Opcional · imagen, PDF o documento de hasta 15 MB. Se adjuntará a cada gasto pagado."}
              </span>
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={payingSelected}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={payingSelected || selectedPending.length === 0} onClick={(event) => { event.preventDefault(); void registerSelectedPayment(); }}>
              {payingSelected ? paymentProof ? "Guardando y adjuntando…" : "Guardando…" : "Confirmar pago"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

export const CreditCardDetail = withQuery(CreditCardDetailView);
