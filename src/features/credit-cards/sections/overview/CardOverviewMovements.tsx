import type { CreditCardExpense, PaymentMethod } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { EmptyState } from "@/shared/components/data-display/EmptyState";

export function CardOverviewMovements({ expenses, cards, personName, installmentsOnly = false }: {
  expenses: CreditCardExpense[];
  cards: PaymentMethod[];
  personName: (id: string | null | undefined) => string;
  installmentsOnly?: boolean;
}) {
  const visible = (installmentsOnly ? expenses.filter((expense) => !!expense.installment) : expenses).slice().sort((a, b) => (b.processDate ?? "").localeCompare(a.processDate ?? ""));
  const cardById = new Map(cards.map((card) => [card.id, card]));
  if (!visible.length) return <EmptyState title={installmentsOnly ? "Sin cuotas" : "Sin movimientos"} description={installmentsOnly ? "No hay compras en cuotas para este período." : "No hay movimientos con estos filtros."} />;
  return <div className="credit-card-surface overflow-x-auto"><table className="w-full min-w-[780px] text-sm"><thead className="border-b bg-muted/20 text-left text-muted-foreground"><tr><th className="p-3 font-medium">Descripción</th><th className="p-3 font-medium">Tarjeta</th><th className="p-3 font-medium">Cuota</th><th className="p-3 text-right font-medium">Monto</th><th className="p-3 font-medium">Estado</th><th className="p-3 font-medium">Persona</th><th className="p-3 font-medium">Fecha</th></tr></thead><tbody>{visible.map((expense) => <tr key={expense.id} className="border-b last:border-0 hover:bg-muted/20"><td className="p-3 font-medium">{expense.description}</td><td className="p-3">{cardById.get(expense.paymentMethodId ?? "")?.name ?? "—"}</td><td className="p-3 text-muted-foreground">{expense.installment ?? "—"}</td><td className="p-3 text-right font-semibold tabular-nums">{formatCurrency(expense.amountInPen ?? expense.amount)}</td><td className="p-3"><StatusBadge status={expense.paymentStatus} /></td><td className="p-3">{personName(expense.personId)}</td><td className="p-3 text-muted-foreground">{expense.processDate ? formatDate(expense.processDate) : "—"}</td></tr>)}</tbody></table></div>;
}
