import { OwnPart } from "@/shared/components/OwnPart";
import { totalsOf } from "@/shared/lib/shared-expense";
import { nameById, useCreditCards, usePeople } from "@/shared/api/hooks/catalogs";
import { useDeleteExpense, useExpenses, useSaveExpense } from "@/shared/api/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { usePeriod } from "@/shared/stores/period.store";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { EmptyState } from "@/shared/components/EmptyState";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from "@/ui/select";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { formatDate } from "@/shared/lib/dates";
import { CREDIT_CARD_STATUSES, EXPENSE_TYPE_LABELS, PAYMENT_STATUS_LABELS } from "@/shared/labels";
import { ExpenseFilters } from "@/shared/components/ExpenseFilters";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { applyExpenseFilters, type ExpenseFilterKey, type ExpenseFilterValues } from "@/shared/lib/expense-filters";
import { useNewExpense } from "@/shared/stores/new-expense.store";

const FILTERS: ExpenseFilterKey[] = ["q", "category", "status", "installments", "type", "shared"];

interface CreditCardDetailProps {
  cardCode: string;
}

// The card is a payment method of type credit_card (D62); the URL uses its code (CMR, IO…) or its id
function CreditCardDetailView({ cardCode }: CreditCardDetailProps) {
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const { data: creditCards, isLoading } = useCreditCards();
  const expenses = useExpenses(EXPENSE_RESOURCES.creditCard, { month: selectedMonth, year: selectedYear }, { byPerson: true }).data ?? [];
  const people = usePeople().data ?? [];
  const personName = nameById(people);
  const saveExpense = useSaveExpense(EXPENSE_RESOURCES.creditCard);
  const deleteExpense = useDeleteExpense(EXPENSE_RESOURCES.creditCard);
  const openNewExpense = useNewExpense((state) => state.openWith);
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(FILTERS);

  const card = creditCards?.find((c) => c.code === cardCode || c.id === cardCode);
  if (isLoading) return null;
  if (!card) return <EmptyState title="Tarjeta no encontrada" />;

  const ofCard = expenses.filter((e) => e.paymentMethodId === card.id);
  const cardExpenses = applyExpenseFilters(ofCard, filters).sort((a, b) =>
    (b.processDate ?? "").localeCompare(a.processDate ?? ""),
  );

  const totals = totalsOf(cardExpenses);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <a href="/tarjetas">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </a>
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: card.color ?? "#6B7280" }} />
        <div>
          <h2 className="text-xl font-bold">{card.name}</h2>
          <p className="text-sm text-muted-foreground">
            {card.billingCloseDay ? `Cierre: día ${card.billingCloseDay} | Pago: día ${card.paymentDueDay}` : "Sin días de cierre y pago"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Total del mes</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-3xl font-bold">{`S/ ${totals.paid.toFixed(2)}`}</span>
          <OwnPart {...totals} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ExpenseFilters
          fields={FILTERS}
          value={filters}
          onChange={setFilters}
          statuses={CREDIT_CARD_STATUSES}
          shown={cardExpenses.length}
          total={ofCard.length}
        />
        <Button
          size="sm"
          className="shrink-0"
          onClick={() => openNewExpense({ destination: "credit_card", paymentMethodId: card.id })}
        >
          <Plus className="mr-1 h-4 w-4" /> Nuevo gasto
        </Button>
      </div>

      {cardExpenses.length === 0 ? (
        <EmptyState
          description={ofCard.length ? "No hay gastos con estos filtros" : "No hay gastos registrados para esta tarjeta"}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Persona</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {cardExpenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{exp.description}</span>
                      {exp.installment && <Badge variant="outline" className="text-xs">{exp.installment}</Badge>}
                    </div>
                    {exp.notes && <p className="text-xs text-muted-foreground">{exp.notes}</p>}
                  </TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={exp.amount} currency={exp.currency} amountInPEN={exp.amountInPen} othersShare={exp.othersShare} />
                  </TableCell>
                  <TableCell>
                    <Select value={exp.paymentStatus} onValueChange={(v) => saveExpense.mutate({ id: exp.id, body: { paymentStatus: v } })}>
                      <SelectTrigger className="h-7 w-auto border-0 p-0">
                        <StatusBadge status={exp.paymentStatus} />
                      </SelectTrigger>
                      <SelectContent>
                        {CREDIT_CARD_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm">{personName(exp.personId)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {exp.processDate ? formatDate(exp.processDate) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={exp.expenseType === "essential" ? "default" : "secondary"} className="text-xs">
                      {EXPENSE_TYPE_LABELS[exp.expenseType]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteExpense.mutate(exp.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

    </div>
  );
}

export const CreditCardDetail = withQuery(CreditCardDetailView);
