import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, CreditCard, HandCoins, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { useCalendar, usePayCalendarEvent } from "@/features/calendar/hooks/calendar";
import type { CalendarEvent } from "@/shared/api/types";
import { eventLabel, gridRange, isPayable } from "@/features/calendar/lib/calendar-view";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { useCreditCards, useCategories } from "@/shared/api/hooks/catalogs";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

type PaymentTab = "card" | "fixed" | "collect" | "debt";
const TAB_ITEMS: { id: PaymentTab; label: string }[] = [
  { id: "card", label: "Tarjeta" },
  { id: "fixed", label: "Costos fijos" },
  { id: "collect", label: "Cobros" },
  { id: "debt", label: "Deudas" },
];

function tabOf(event: CalendarEvent): PaymentTab | null {
  if (event.refType === "card_statement") return "card";
  if (event.refType === "fixed_cost" || event.refType === "subscription") return "fixed";
  if (event.kind === "debt_owed_to_me") return "collect";
  if (event.kind === "debt_i_owe") return "debt";
  return null;
}

const eventKey = (event: CalendarEvent) => `${event.refType}:${event.refId}`;

function daysUntil(date: string) {
  const due = new Date(`${date.slice(0, 10)}T00:00:00Z`).getTime();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
  return Math.round((due - new Date(`${today}T00:00:00Z`).getTime()) / 86_400_000);
}

export function DashboardPaymentDialog({ open, onOpenChange, initialTab = "card" }: { open: boolean; onOpenChange: (open: boolean) => void; initialTab?: PaymentTab }) {
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const { from, to } = gridRange(month, year);
  const events = useCalendar(from, to).data ?? [];
  const cardExpenses = useExpenses(EXPENSE_RESOURCES.creditCard, { month, year }).data ?? [];
  const fixedCosts = useExpenses(EXPENSE_RESOURCES.fixedCost, { month, year }).data ?? [];
  const subscriptions = useExpenses(EXPENSE_RESOURCES.subscription, { month, year }).data ?? [];
  const cards = useCreditCards().data ?? [];
  const categories = useCategories().data ?? [];
  const payEvent = usePayCalendarEvent();
  const [tab, setTab] = useState<PaymentTab>("card");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [selectionInitialized, setSelectionInitialized] = useState(false);

  const payable = useMemo(() => events.filter(isPayable).filter((event) => tabOf(event) === tab), [events, tab]);
  const selectedEvents = payable.filter((event) => selected.has(eventKey(event)));
  const total = selectedEvents.reduce((sum, event) => sum + (event.amount ?? 0), 0);

  const expenseClassification = (event: CalendarEvent) => {
    if (event.refType === "fixed_cost" || event.refType === "subscription") {
      const expense = [...fixedCosts, ...subscriptions].find((item) => item.id === event.refId);
      if (!expense) return event.refType === "subscription" ? "Plataforma" : "Costo fijo";
      const category = categories.find((item) => item.id === expense.categoryId)?.name ?? "Sin categoría";
      const expenseType = expense.expenseType === "essential" ? "Necesario" : "Gusto";
      return `${category} · ${expenseType}`;
    }

    if (event.refType === "card_statement") {
      const card = cards.find((item) => item.name === event.name);
      const expenses = cardExpenses.filter((expense) => expense.paymentMethodId === card?.id);
      if (!expenses.length) return "Tarjeta de crédito";
      const totals = expenses.reduce((acc, expense) => {
        const type = expense.expenseType === "essential" ? "Necesario" : "Gusto";
        acc[type] = (acc[type] ?? 0) + (expense.amountInPen ?? expense.amount);
        return acc;
      }, {} as Record<string, number>);
      return Object.entries(totals).map(([type, amount]) => `${type} ${formatCurrency(amount)}`).join(" · ");
    }

    if (event.kind === "debt_owed_to_me") return "Cobro de préstamo";
    if (event.kind === "debt_i_owe") return "Pago de préstamo";
    return "Sin categoría";
  };

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setSelected(new Set());
    setSelectionInitialized(false);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open || !events.length || selectionInitialized) return;
    const defaults = events.filter((event) => {
      const category = tabOf(event);
      if (!category || !isPayable(event)) return false;
      return event.status === "late" || daysUntil(event.date) <= 7;
    });
    setSelected(new Set(defaults.map(eventKey)));
    setSelectionInitialized(true);
  }, [events, open, selectionInitialized]);

  const toggle = (event: CalendarEvent, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(eventKey(event));
      else next.delete(eventKey(event));
      return next;
    });
  };

  const submit = async () => {
    if (!selectedEvents.length || submitting) return;
    setSubmitting(true);
    const results = await Promise.allSettled(selectedEvents.map((event) =>
      payEvent.mutateAsync({ refType: event.refType as "card_statement" | "fixed_cost" | "subscription" | "debt", refId: event.refId! }),
    ));
    const paid = results.filter((result) => result.status === "fulfilled" && result.value === "Pagado").length;
    const failed = results.length - results.filter((result) => result.status === "fulfilled").length;
    if (paid) toast.success(`${paid} ${paid === 1 ? "pago registrado" : "pagos registrados"}`);
    if (failed) toast.error(`${failed} ${failed === 1 ? "pago no se pudo registrar" : "pagos no se pudieron registrar"}`);
    setSubmitting(false);
    if (!failed) onOpenChange(false);
    setSelected(new Set());
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar pago"
      description="Elige qué vas a pagar. Se registra un pago por cada elemento."
      contentClassName="sm:max-w-2xl"
      footer={<><Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancelar</Button><Button onClick={submit} disabled={!selectedEvents.length || submitting}><Check className="mr-2 size-4" />Registrar {selectedEvents.length} {selectedEvents.length === 1 ? "pago" : "pagos"}</Button></>}
    >
      <div className="space-y-4 py-2">
        <Tabs value={tab} onValueChange={(value) => setTab(value as PaymentTab)}>
          <TabsList className="grid h-auto w-full grid-cols-4">
            {TAB_ITEMS.map((item) => <TabsTrigger key={item.id} value={item.id} className="px-1.5 text-xs sm:text-sm">{item.label}</TabsTrigger>)}
          </TabsList>
          {TAB_ITEMS.map(({ id }) => {
            const rows = id === tab ? payable : events.filter(isPayable).filter((event) => tabOf(event) === id);
            return (
              <TabsContent key={id} value={id} className="mt-3">
                {rows.length ? (
                  <div className="max-h-64 divide-y overflow-y-auto rounded-xl border">
                    {rows.map((event) => {
                      const checked = selected.has(eventKey(event));
                      const due = daysUntil(event.date);
                      const isLate = event.status === "late" || due < 0;
                      const Icon = id === "card" ? CreditCard : id === "fixed" ? ReceiptText : HandCoins;
                      return (
                        <label key={eventKey(event)} className={`flex cursor-pointer items-center gap-3 px-3.5 py-3 transition-colors ${checked ? "bg-muted/60" : "hover:bg-muted/30"}`}>
                          <Checkbox checked={checked} onCheckedChange={(value) => toggle(event, value === true)} />
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted"><Icon className="size-4 text-muted-foreground" /></div>
                          <div className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2 text-sm font-medium">{eventLabel(event)}{isLate && <Badge variant="destructive" className="px-2 py-0">Retrasado</Badge>}</span>
                            <span className="block truncate text-xs text-muted-foreground">{isLate ? `Venció ${formatDate(event.date)} · retrasado ${Math.abs(due)} días` : `Vence ${formatDate(event.date)}`}</span>
                            <span className="block truncate text-xs text-muted-foreground">{expenseClassification(event)}</span>
                          </div>
                          <span className="shrink-0 text-sm font-semibold tabular-nums">{event.amount == null ? "—" : formatCurrency(event.amount, event.currency)}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed text-center">
                    <CalendarDays className="mb-2 size-5 text-muted-foreground" />
                    <p className="text-sm font-medium">No hay pagos pendientes en esta sección</p>
                    <p className="mt-1 text-xs text-muted-foreground">{month} / {year}</p>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
        <div className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
          <span className="text-muted-foreground">{selectedEvents.length} seleccionados</span>
          <span className="font-semibold tabular-nums">Total a registrar <span className="ml-2 text-foreground">{formatCurrency(total)}</span></span>
        </div>
        <p className="text-xs text-muted-foreground">Los pagos se aplican al saldo completo de cada elemento seleccionado.</p>
      </div>
    </ResponsiveDialog>
  );
}
