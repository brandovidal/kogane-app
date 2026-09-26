import { OwnPart } from "@/shared/components/OwnPart";
import { totalsOf } from "@/shared/lib/shared-expense";
import { nameById, useCreditCards, usePeople, useMe } from "@/shared/api/hooks/catalogs";
import { useDeleteExpense, useExpenses, useSaveExpense } from "@/shared/api/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES, type CreditCardExpense } from "@/shared/api/types";
import { usePeriod } from "@/shared/stores/period.store";
import { formatCurrency } from "@/shared/lib/currency";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { EmptyState } from "@/shared/components/EmptyState";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { DataView, useViewMode, ViewToggle, type Column } from "@/shared/components/DataView";
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from "@/ui/select";
import { useState } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { Switch } from "@/ui/switch";
import { RowActions } from "@/shared/components/RowActions";
import { duplicateBody, nextMonthBody } from "@/shared/lib/expense-actions";
import { ExpenseEditDialog } from "@/features/expenses/components/ExpenseEditDialog";
import { formatDate } from "@/shared/lib/dates";
import { CREDIT_CARD_STATUSES, EXPENSE_TYPE_LABELS, PAYMENT_STATUS_LABELS } from "@/shared/labels";
import { ExpenseFilters } from "@/shared/components/ExpenseFilters";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { applyExpenseFilters, type ExpenseFilterKey, type ExpenseFilterValues } from "@/shared/lib/expense-filters";
import { useNewExpense } from "@/shared/stores/new-expense.store";

const FILTERS: ExpenseFilterKey[] = ["person", "q", "category", "status", "installments", "type", "shared"];

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
  const openNewExpense = useNewExpense((state) => state.openWith);
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>(FILTERS);
  const me = useMe();
  const [view, setView] = useViewMode("card-detail", "table");
  const [editing, setEditing] = useState<CreditCardExpense | undefined>();
  const [groupedByPerson, setGroupedByPerson] = useState(false);

  const card = creditCards?.find((c) => c.code === cardCode || c.id === cardCode);
  if (isLoading) return null;
  if (!card) return <EmptyState title="Tarjeta no encontrada" />;

  const ofCard = expenses.filter((e) => e.paymentMethodId === card.id);
  const cardExpenses = applyExpenseFilters(ofCard, filters, me).sort((a, b) =>
    (b.processDate ?? "").localeCompare(a.processDate ?? ""),
  );

  const totals = totalsOf(cardExpenses);

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
        <div className="flex shrink-0 items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={groupedByPerson} onCheckedChange={setGroupedByPerson} /> Agrupar por persona
          </label>
          <ViewToggle value={view} onChange={setView} />
          <Button size="sm" onClick={() => openNewExpense({ destination: "credit_card", paymentMethodId: card.id })}>
            <Plus className="mr-1 h-4 w-4" /> Nuevo gasto
          </Button>
        </div>
      </div>

      {cardExpenses.length === 0 ? (
        <EmptyState
          description={ofCard.length ? "No hay gastos con estos filtros" : "No hay gastos registrados para esta tarjeta"}
        />
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
                <DataView items={group.expenses} columns={columns} rowKey={(exp) => exp.id} view={view} />
              </section>
            );
          })}
        </div>
      ) : (
        <DataView items={cardExpenses} columns={columns} rowKey={(exp) => exp.id} view={view} />
      )}

      <ExpenseEditDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(undefined)}
        resource={EXPENSE_RESOURCES.creditCard}
        expense={editing}
      />

    </div>
  );
}

export const CreditCardDetail = withQuery(CreditCardDetailView);
