import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, CreditCard, FileUp, HandCoins, MessageCircle, Plus, ReceiptText, WalletCards } from "lucide-react";
import type { Summary } from "@/shared/api/types";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { useDebts } from "@/features/debts/hooks/debts";
import { useDraftCount } from "@/features/drafts/hooks/drafts";
import { useNewExpense } from "@/features/new-expense/stores/new-expense.store";
import { useCreditCards } from "@/shared/api/hooks/catalogs";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDayMonth, getMonthName } from "@/shared/lib/dates";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

type PendingFilter = "all" | "soon" | "late";
type PendingItem = { id: string; title: string; detail: string; amount: number | null; dueDate: string | null; tone: "red" | "amber" | "green" | "blue"; href: string; action: string; tab: "card" | "fixed" | "collect" | "debt"; paid?: boolean };

function dayDifference(date: string | null, today: Date) {
  if (!date) return null;
  const due = new Date(`${date.slice(0, 10)}T00:00:00`);
  return Math.round((due.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86_400_000);
}

export function DashboardOverview({ summary, month, year, onRegisterPayment }: { summary: Summary | undefined; month: number; year: number; onRegisterPayment: (tab: "card" | "fixed" | "collect" | "debt") => void }) {
  const fixedCostsQuery = useExpenses(EXPENSE_RESOURCES.fixedCost, { month, year });
  const cardExpensesQuery = useExpenses(EXPENSE_RESOURCES.creditCard, { month, year });
  const debtsQuery = useDebts();
  const cards = useCreditCards().data ?? [];
  const draftCount = useDraftCount().data ?? 0;
  const openNewExpense = useNewExpense((state) => state.openWith);
  const [filter, setFilter] = useState<PendingFilter>("all");
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  const fixedCosts = fixedCostsQuery.data ?? [];
  const cardExpenses = cardExpensesQuery.data ?? [];
  const debts = debtsQuery.data ?? [];

  const items = useMemo<PendingItem[]>(() => {
    const pendingCosts = fixedCosts.filter((cost) => !["paid", "waived", "amortized", "cashback", "skipped"].includes(cost.paymentStatus));
    const costItems: PendingItem[] = pendingCosts.map((cost) => ({
      id: `cost-${cost.id}`,
      title: cost.description,
      detail: `Costo fijo · ${cost.installment ?? "Pendiente"}`,
      amount: cost.amountInPen ?? cost.amount,
      dueDate: cost.dueDate,
      tone: "amber",
      href: `/costos-fijos?scope=payable&month=${month}&year=${year}`,
      action: "Registrar pago",
      tab: "fixed",
    }));
    const pendingCardItems: PendingItem[] = cards.flatMap((card) => {
      const expenses = cardExpenses.filter((expense) => expense.paymentMethodId === card.id && !["paid", "waived", "amortized", "cashback", "skipped"].includes(expense.paymentStatus));
      if (!expenses.length) return [];
      const paymentDueDay = card.paymentDueDay ?? 0;
      const due = paymentDueDay > 0 ? new Date(year, month - 1, paymentDueDay) : null;
      const dueDate = due ? `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}` : null;
      const total = expenses.reduce((sum, expense) => sum + (expense.amountInPen ?? expense.amount), 0);
      return [{ id: `card-${card.id}`, title: card.name, detail: `${expenses.length} ${expenses.length === 1 ? "movimiento" : "movimientos"} · pago de tarjeta`, amount: total, dueDate, tone: "red", href: "/tarjetas", action: "Registrar pago", tab: "card" }];
    });
    const debtItems: PendingItem[] = debts
      .filter((debt) => debt.paymentYear * 12 + debt.paymentMonth <= year * 12 + month && debt.status !== "paid" && debt.status !== "cashback")
      .map((debt) => ({
        id: `debt-${debt.id}`,
        title: debt.description,
        detail: `${debt.person.name} · ${debt.installment ?? (debt.direction === "owed_to_me" ? "Cobro" : "Deuda")}`,
        amount: debt.balance,
        dueDate: debt.dueDate,
        tone: debt.timing === "late" ? "red" : "blue",
        href: debt.direction === "owed_to_me" ? "/cobros" : "/deudas",
        action: debt.direction === "owed_to_me" ? "Registrar cobro" : "Pagar",
        tab: debt.direction === "owed_to_me" ? "collect" : "debt",
      }));
    const previousPeriod = year * 12 + month < new Date().getFullYear() * 12 + new Date().getMonth() + 1;
    const paidCardItems: PendingItem[] = previousPeriod
      ? cards.flatMap((card) => {
          const total = cardExpenses.filter((expense) => expense.paymentMethodId === card.id && expense.paymentStatus === "paid").reduce((sum, expense) => sum + (expense.amountInPen ?? expense.amount), 0);
          return total > 0 ? [{ id: `card-paid-${card.id}`, title: `${card.name} · tarjeta pagada`, detail: "Pago registrado en este período", amount: total, dueDate: null, tone: "green" as const, href: "/tarjetas", action: "Ver tarjeta", tab: "card" as const, paid: true }] : [];
        })
      : [];
    if (summary?.budget?.isProposal) {
      costItems.push({ id: "budget-proposal", title: "Sueldo del mes en borrador", detail: "Confirma el ingreso para actualizar tu presupuesto", amount: summary.budget.salary, dueDate: null, tone: "blue", href: "/resumen", action: "Revisar", tab: "fixed" });
    }
    if (draftCount > 0) {
      costItems.push({ id: "drafts", title: "Borradores sin confirmar", detail: `${draftCount} ${draftCount === 1 ? "movimiento pendiente" : "movimientos pendientes"} de revisión`, amount: null, dueDate: null, tone: "blue", href: "/borrador", action: "Revisar", tab: "fixed" });
    }
    return [...pendingCardItems, ...costItems, ...debtItems, ...paidCardItems].sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    });
  }, [fixedCosts, cardExpenses, cards, debts, month, year, summary?.budget, draftCount]);

  const visibleItems = today ? items : [];
  const visibleDraftCount = today ? draftCount : 0;
  const filtered = visibleItems.filter((item) => {
    const delta = dayDifference(item.dueDate, today!);
    if (filter === "late") return !item.paid && delta != null && delta < 0;
    if (filter === "soon") return !item.paid && delta != null && delta >= 0 && delta <= 7;
    return true;
  });
  const lateCount = visibleItems.filter((item) => !item.paid && (dayDifference(item.dueDate, today!) ?? 0) < 0).length;
  const soonCount = visibleItems.filter((item) => !item.paid && (() => { const delta = dayDifference(item.dueDate, today!); return delta != null && delta >= 0 && delta <= 7; })()).length;
  const isBilled = year * 12 + month < new Date().getFullYear() * 12 + new Date().getMonth() + 1;
  const renderItem = (item: PendingItem) => {
    const days = dayDifference(item.dueDate, today!);
    const amount = item.amount == null ? "—" : formatCurrency(item.amount);
    return (
      <div key={item.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-1 last:pb-1">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${item.tone === "red" ? "bg-destructive/15 text-destructive" : item.tone === "amber" ? "bg-amber-500/15 text-amber-400" : item.tone === "green" ? "bg-emerald-500/15 text-emerald-400" : "bg-primary/15 text-primary"}`}>
          {item.tab === "collect" || item.tab === "debt" ? <HandCoins className="size-4" /> : item.id.startsWith("draft") ? <FileUp className="size-4" /> : <ReceiptText className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium"><span className={`truncate ${item.paid ? "text-muted-foreground" : ""}`}>{item.title}</span>{item.paid ? <Badge className="bg-emerald-500/10 text-emerald-400">Pagada</Badge> : days != null && <Badge variant={days < 0 ? "destructive" : "secondary"} className="px-1.5 py-0 text-[10px]">{days < 0 ? `${Math.abs(days)} d` : days === 0 ? "Hoy" : `${days} d`}</Badge>}</div>
          <p className="truncate text-xs text-muted-foreground">{item.detail}{item.dueDate ? ` · vence ${formatDayMonth(item.dueDate)}` : ""}</p>
        </div>
        <span className="min-w-24 text-right text-sm font-semibold tabular-nums">{amount}</span>
        {item.paid || item.action === "Revisar" ? <Button asChild variant={item.paid ? "ghost" : "outline"} size="sm" className={`min-w-24 ${item.paid ? "text-emerald-400" : ""}`}><a href={item.href}>{item.action}</a></Button> : <Button variant="outline" size="sm" className="min-w-24" onClick={() => onRegisterPayment(item.tab)}>{item.action}</Button>}
      </div>
    );
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-base">{isBilled ? `Por cerrar de ${getMonthName(month).toLowerCase()}` : "Pendientes del mes"} <Badge variant="secondary">{visibleItems.filter((item) => !item.paid).length}</Badge></CardTitle>
            <div className="flex rounded-lg border bg-muted/50 p-0.5">
              {([ ["all", "Todos"], ["soon", `Vencen pronto${soonCount ? ` ${soonCount}` : ""}`], ["late", `Retrasados${lateCount ? ` ${lateCount}` : ""}`] ] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${filter === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{label}</button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length ? <div className="divide-y">{filtered.slice(0, 6).map(renderItem)}</div> : <div className="flex min-h-32 flex-col items-center justify-center text-center"><span className="mb-2 flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400"><Bell className="size-5" /></span><p className="text-sm font-medium">{filter === "all" ? "No tienes pendientes este mes" : filter === "soon" ? "No hay vencimientos próximos" : "No tienes pagos retrasados"}</p><p className="mt-1 text-xs text-muted-foreground">Los próximos pagos aparecerán aquí.</p></div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Accesos rápidos</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={() => openNewExpense()} className="flex min-h-20 flex-col items-start justify-between rounded-xl bg-primary px-3.5 py-3 text-left text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="size-4" /><span className="text-sm font-medium">Nuevo gasto</span>
          </button>
          <button type="button" onClick={() => onRegisterPayment("card")} className="flex min-h-20 flex-col items-start justify-between rounded-xl border bg-muted/40 px-3.5 py-3 text-left text-sm font-medium transition-colors hover:bg-muted"><CreditCard className="size-4 text-primary" /><span>Registrar pago</span></button>
          <a href="/mensajes" className="flex min-h-20 flex-col items-start justify-between rounded-xl border bg-muted/40 px-3.5 py-3 text-sm font-medium transition-colors hover:bg-muted"><MessageCircle className="size-4 text-primary" /><span>Mensajes</span></a>
          <a href="/importacion" className="flex min-h-20 flex-col items-start justify-between rounded-xl border bg-muted/40 px-3.5 py-3 text-sm font-medium transition-colors hover:bg-muted"><FileUp className="size-4 text-primary" /><span>Importar</span></a>
          <a href="/borrador" className="relative flex min-h-20 flex-col items-start justify-between rounded-xl border bg-muted/40 px-3.5 py-3 text-sm font-medium transition-colors hover:bg-muted"><WalletCards className="size-4 text-primary" /><span>Borrador</span>{visibleDraftCount > 0 && <Badge variant="destructive" className="absolute right-2.5 top-2.5 min-w-5 justify-center px-1">{visibleDraftCount}</Badge>}</a>
          <a href="/calendario" className="flex min-h-20 flex-col items-start justify-between rounded-xl border bg-muted/40 px-3.5 py-3 text-sm font-medium transition-colors hover:bg-muted"><CalendarDays className="size-4 text-primary" /><span>Calendario</span></a>
        </CardContent>
      </Card>
    </div>
  );
}
