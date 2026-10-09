import { useEffect, useMemo, useState } from "react";
import { PendingCard } from "@/features/dashboard/components/PendingCard";
import type { PendingEntry } from "@/features/dashboard/lib/pending-groups";
import { usePeriod } from "@/shared/stores/period.store";
import {
  CalendarDays,
  CreditCard,
  FileUp,
  MessageCircle,
  Plus,
  WalletCards,
} from "lucide-react";
import type { Summary } from "@/shared/api/types";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { useDebts } from "@/features/debts/hooks/debts";
import { useDraftCount } from "@/features/drafts/hooks/drafts";
import { useNewExpense } from "@/features/new-expense/stores/new-expense.store";
import { useCreditCards } from "@/shared/api/hooks/catalogs";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

export function DashboardOverview({
  summary,
  month,
  year,
  onRegisterPayment,
}: {
  summary: Summary | undefined;
  month: number;
  year: number;
  onRegisterPayment: (tab: "card" | "fixed" | "collect" | "debt") => void;
}) {
  const fixedCostsQuery = useExpenses(EXPENSE_RESOURCES.fixedCost, {
    month,
    year,
  });
  const cardExpensesQuery = useExpenses(EXPENSE_RESOURCES.creditCard, {
    month,
    year,
  });
  const debtsQuery = useDebts();
  const cards = useCreditCards().data ?? [];
  const draftCount = useDraftCount().data ?? 0;
  const openNewExpense = useNewExpense((state) => state.openWith);
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  const fixedCosts = fixedCostsQuery.data ?? [];
  const cardExpenses = cardExpensesQuery.data ?? [];
  const debts = debtsQuery.data ?? [];

  const items = useMemo<PendingEntry[]>(() => {
    const open = (status: string) =>
      !["paid", "waived", "amortized", "cashback", "skipped"].includes(status);
    const costItems: PendingEntry[] = fixedCosts
      .filter((cost) => open(cost.paymentStatus))
      .map((cost) => ({
        id: `cost-${cost.id}`,
        kind: "fixed",
        title: cost.description,
        detail: `Costo fijo · ${cost.installment ?? "Pendiente"}`,
        amount: cost.amountInPen ?? cost.amount,
        dueDate: cost.dueDate,
        href: `/costos-fijos?scope=payable&month=${month}&year=${year}`,
        action: "Pagar",
      }));
    const cardItems: PendingEntry[] = cards.flatMap((card) => {
      const expenses = cardExpenses.filter(
        (expense) =>
          expense.paymentMethodId === card.id && open(expense.paymentStatus),
      );
      if (!expenses.length) return [];
      const paymentDueDay = card.paymentDueDay ?? 0;
      const due =
        paymentDueDay > 0 ? new Date(year, month - 1, paymentDueDay) : null;
      const dueDate = due
        ? `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`
        : null;
      const total = expenses.reduce(
        (sum, expense) => sum + (expense.amountInPen ?? expense.amount),
        0,
      );
      return [
        {
          id: `card-${card.id}`,
          kind: "card" as const,
          title: card.name,
          detail: `${expenses.length} ${expenses.length === 1 ? "movimiento" : "movimientos"} · pago de tarjeta`,
          amount: total,
          dueDate,
          href: "/tarjetas",
          action: "Pagar",
        },
      ];
    });
    const debtItems: PendingEntry[] = debts
      .filter(
        (debt) =>
          debt.paymentYear * 12 + debt.paymentMonth <= year * 12 + month &&
          debt.status !== "paid" &&
          debt.status !== "cashback",
      )
      .map((debt) => {
        const collect = debt.direction === "owed_to_me";
        return {
          id: `debt-${debt.id}`,
          kind: collect ? ("collect" as const) : ("debt" as const),
          title: debt.description,
          detail: `${collect ? "Cobro" : "Deuda"} · ${debt.person.name}${debt.installment ? ` · ${debt.installment}` : ""}`,
          amount: debt.balance,
          dueDate: debt.dueDate,
          person: debt.person.name,
          href: collect ? "/cobros" : "/deudas",
          action: collect ? "Cobrar" : "Pagar",
        };
      });
    const previousPeriod =
      year * 12 + month <
      new Date().getFullYear() * 12 + new Date().getMonth() + 1;
    const paidCardItems: PendingEntry[] = previousPeriod
      ? cards.flatMap((card) => {
          const total = cardExpenses
            .filter(
              (expense) =>
                expense.paymentMethodId === card.id &&
                expense.paymentStatus === "paid",
            )
            .reduce(
              (sum, expense) => sum + (expense.amountInPen ?? expense.amount),
              0,
            );
          return total > 0
            ? [
                {
                  id: `card-paid-${card.id}`,
                  kind: "card" as const,
                  title: `${card.name} · tarjeta pagada`,
                  detail: "Pago registrado en este período",
                  amount: total,
                  dueDate: null,
                  paid: true,
                  href: "/tarjetas",
                  action: "Ver tarjeta",
                },
              ]
            : [];
        })
      : [];
    const reviewItems: PendingEntry[] = [];
    if (summary?.budget?.isProposal) {
      reviewItems.push({
        id: "budget-proposal",
        kind: "review",
        title: "Sueldo del mes en borrador",
        detail: "Confirma el ingreso para actualizar tu presupuesto",
        amount: summary.budget.salary,
        dueDate: null,
        href: "/resumen",
        action: "Revisar",
      });
    }
    if (draftCount > 0) {
      reviewItems.push({
        id: "drafts",
        kind: "review",
        title: "Borrador sin confirmar",
        detail: `${draftCount} ${draftCount === 1 ? "movimiento" : "movimientos"} · pendientes de revisión`,
        amount: null,
        dueDate: null,
        href: "/borrador",
        action: "Revisar",
      });
    }
    return [
      ...cardItems,
      ...costItems,
      ...debtItems,
      ...reviewItems,
      ...paidCardItems,
    ];
  }, [
    fixedCosts,
    cardExpenses,
    cards,
    debts,
    month,
    year,
    summary?.budget,
    draftCount,
  ]);

  const visibleDraftCount = today ? draftCount : 0;
  const isBilled =
    year * 12 + month <
    new Date().getFullYear() * 12 + new Date().getMonth() + 1;
  const setPeriod = usePeriod((state) => state.setPeriod);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <div className="space-y-4">
        {today && (
          <PendingCard
            entries={items}
            today={today}
            month={month}
            year={year}
            isBilled={isBilled}
            onGoToPreviousMonth={() =>
              setPeriod(
                month === 1 ? 12 : month - 1,
                month === 1 ? year - 1 : year,
              )
            }
            onRegisterPayment={onRegisterPayment}
          />
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Accesos rápidos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => openNewExpense()}
            className="flex min-h-20 flex-col items-start justify-between rounded-xl bg-primary px-3.5 py-3 text-left text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            <span className="text-sm font-medium">Nuevo gasto</span>
          </button>
          <button
            type="button"
            onClick={() => onRegisterPayment("card")}
            className="flex min-h-20 flex-col items-start justify-between rounded-xl border bg-muted/40 px-3.5 py-3 text-left text-sm font-medium transition-colors hover:bg-muted"
          >
            <CreditCard className="size-4 text-primary" />
            <span>Registrar pago</span>
          </button>
          <a
            href="/mensajes"
            className="flex min-h-20 flex-col items-start justify-between rounded-xl border bg-muted/40 px-3.5 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <MessageCircle className="size-4 text-primary" />
            <span>Mensajes</span>
          </a>
          <a
            href="/importacion"
            className="flex min-h-20 flex-col items-start justify-between rounded-xl border bg-muted/40 px-3.5 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <FileUp className="size-4 text-primary" />
            <span>Importar</span>
          </a>
          <a
            href="/borrador"
            className="relative flex min-h-20 flex-col items-start justify-between rounded-xl border bg-muted/40 px-3.5 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <WalletCards className="size-4 text-primary" />
            <span>Borrador</span>
            {visibleDraftCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute right-2.5 top-2.5 min-w-5 justify-center px-1"
              >
                {visibleDraftCount}
              </Badge>
            )}
          </a>
          <a
            href="/calendario"
            className="flex min-h-20 flex-col items-start justify-between rounded-xl border bg-muted/40 px-3.5 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <CalendarDays className="size-4 text-primary" />
            <span>Calendario</span>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
