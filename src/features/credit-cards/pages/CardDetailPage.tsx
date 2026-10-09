import { OwnPart } from "@/features/expenses/components/OwnPart";
import { totalsOf } from "@/features/expenses/lib/shared-expense";
import {
  nameById,
  useCreditCards,
  usePeople,
  useMe,
  useCategories,
} from "@/shared/api/hooks/catalogs";
import {
  useDeleteExpense,
  useExpenses,
  useSaveExpense,
} from "@/features/expenses/hooks/expenses";
import { saveExpense as saveExpenseRequest } from "@/features/expenses/services/expense.service";
import {
  useStatement,
  useStatements,
} from "@/features/statements/hooks/statements";
import { withQuery } from "@/shared/api/query";
import {
  EXPENSE_RESOURCES,
  type Attachment,
  type CreditCardExpense,
} from "@/shared/api/types";
import { useUploadAttachment } from "@/features/attachments/hooks/attachments";
import { usePeriod } from "@/shared/stores/period.store";
import { formatCurrency } from "@/shared/lib/currency";
import { StatusBadge } from "@/features/expenses/components/StatusBadge";
import { CurrencyDisplay } from "@/features/expenses/components/CurrencyDisplay";
import { EmptyState } from "@/shared/components/data-display/EmptyState";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import { GroupedDataView } from "@/shared/components/data-display/GroupedDataView";
import { ViewToggle } from "@/shared/components/data-display/ViewToggle";
import { useViewMode } from "@/shared/hooks/useViewMode";
import { type Column } from "@/shared/types/data-view";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChartPie, List, Wallet } from "lucide-react";
import { RowActions } from "@/features/expenses/components/RowActions";
import {
  duplicateBody,
  nextMonthBody,
} from "@/features/expenses/lib/expense-actions";
import { ExpenseEditDialog } from "@/features/expenses/components/ExpenseEditDialog";
import { formatDate } from "@/shared/lib/dates";
import { ATTACHMENT_KIND_LABELS } from "@/features/attachments/constants/attachments";
import { CREDIT_CARD_STATUSES } from "@/features/credit-cards/constants/statuses";
import { EXPENSE_TYPE_LABELS } from "@/shared/constants/finance";
import { ExpenseFilters } from "@/features/expenses/components/filters/ExpenseFilters";
import { ActiveExpenseFilterChips } from "@/features/expenses/components/filters/ActiveExpenseFilterChips";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { applyExpenseFilters } from "@/features/expenses/lib/expense-filters";
import type { ExpenseFilterValues } from "@/features/expenses/types/expense-filters";
import { useNewExpense } from "@/features/new-expense/stores/new-expense.store";
import { StatementMinimumCard } from "../components/StatementMinimumCard";
import { StatementTotalCard } from "../components/StatementTotalCard";
import { CardCategoryBreakdown } from "../components/CardCategoryBreakdown";
import { StatementBalanceSummary } from "@/features/statements/components/StatementBalanceSummary";
import { StatementPaymentSummary } from "@/features/statements/components/StatementPaymentSummary";
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
import { expenseKeys } from "@/features/expenses/hooks/expenses";
import { isPaidStatus } from "@/features/expenses/lib/expense-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { CardDetailHeader } from "../sections/detail/CardDetailHeader";
import { CardDetailMetrics } from "../sections/detail/CardDetailMetrics";
import { CardEditorDialog } from "../components/CardEditorDialog";

import {
  CARD_DETAIL_FILTER_KEYS,
  CARD_DETAIL_GROUP_OPTIONS,
} from "../constants/filters";

interface CreditCardDetailProps {
  cardCode: string;
}

// The card is a payment method of type credit_card (D62); the URL uses its code (CMR, IO…) or its id
function CreditCardDetailView({ cardCode }: CreditCardDetailProps) {
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const { data: creditCards, isLoading } = useCreditCards();
  const expenses =
    useExpenses(EXPENSE_RESOURCES.creditCard, {
      month: selectedMonth,
      year: selectedYear,
    }).data ?? [];
  const people = usePeople().data ?? [];
  const categories = useCategories().data ?? [];
  const personName = nameById(people);
  const categoryName = (id: string | null) =>
    categories.find((item) => item.id === id)?.name ?? "Sin categoría";
  const saveExpense = useSaveExpense(EXPENSE_RESOURCES.creditCard);
  const deleteExpense = useDeleteExpense(EXPENSE_RESOURCES.creditCard);
  const uploadAttachment = useUploadAttachment({ quiet: true });
  const queryClient = useQueryClient();
  const openNewExpense = useNewExpense((state) => state.openWith);
  const [filters, setFilters] = useUrlFilters<ExpenseFilterValues>([
    ...CARD_DETAIL_FILTER_KEYS,
  ]);
  const [groupBy, setGroupBy] = useState<string>("none");
  const me = useMe();
  const [view, setView] = useViewMode("card-detail", "table");
  const [editing, setEditing] = useState<CreditCardExpense | undefined>();
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    () => new Set(),
  );
  const [confirmPayment, setConfirmPayment] = useState(false);
  const [payingSelected, setPayingSelected] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofKind, setPaymentProofKind] =
    useState<Attachment["kind"]>("boleta");
  const [activeTab, setActiveTab] = useState<
    "expenses" | "card-detail" | "payment"
  >("expenses");
  const [editingCard, setEditingCard] = useState(false);

  const card = creditCards?.find(
    (c) => c.code === cardCode || c.id === cardCode,
  );
  const statements = useStatements().data ?? [];
  const statement = card
    ? statements.find(
        (item) =>
          item.paymentMethodId === card.id &&
          item.paymentMonth === selectedMonth &&
          item.paymentYear === selectedYear,
      )
    : undefined;
  // The list only has the balances the bank stated; the breakdown (D95) comes from the full statement
  const { data: statementDetail } = useStatement(statement?.id ?? null);
  if (isLoading) return null;
  if (!card) return <EmptyState title="Tarjeta no encontrada" />;

  const ofCard = expenses.filter((e) => e.paymentMethodId === card.id);
  const cardExpenses = applyExpenseFilters(ofCard, filters, me).sort((a, b) =>
    (b.processDate ?? "").localeCompare(a.processDate ?? ""),
  );
  const selectedPending = cardExpenses.filter(
    (expense) =>
      selectedExpenses.has(expense.id) && !isPaidStatus(expense.paymentStatus),
  );
  const activeCategories = [
    ...new Set(ofCard.map((expense) => expense.categoryId ?? "none")),
  ];
  const categoryTotals = new Map<string, number>();
  for (const expense of ofCard)
    categoryTotals.set(
      expense.categoryId ?? "none",
      (categoryTotals.get(expense.categoryId ?? "none") ?? 0) +
        (expense.amountInPen ?? expense.amount),
    );
  const largestCategoryId = [...categoryTotals].sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  const registerSelectedPayment = async () => {
    if (!selectedPending.length) return;
    setPayingSelected(true);
    const results = await Promise.allSettled(
      selectedPending.map((expense) =>
        saveExpenseRequest(EXPENSE_RESOURCES.creditCard, {
          id: expense.id,
          body: { paymentStatus: "paid" },
        }),
      ),
    );
    const completedExpenses = selectedPending.filter(
      (_, index) => results[index]?.status === "fulfilled",
    );
    const completed = completedExpenses.length;
    const failed = results.length - completed;
    let attached = 0;
    let attachmentFailed = 0;
    if (paymentProof && completedExpenses.length) {
      const files = await Promise.allSettled(
        completedExpenses.map((expense) =>
          uploadAttachment.mutateAsync({
            file: paymentProof,
            refType: "expense",
            refId: expense.id,
            kind: paymentProofKind,
          }),
        ),
      );
      attached = files.filter((result) => result.status === "fulfilled").length;
      attachmentFailed = files.length - attached;
    }
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: expenseKeys.resource(EXPENSE_RESOURCES.creditCard),
      }),
      queryClient.invalidateQueries({ queryKey: ["summary"] }),
      queryClient.invalidateQueries({ queryKey: ["statements"] }),
    ]);
    if (completed)
      toast.success(
        `${completed} ${completed === 1 ? "pago registrado" : "pagos registrados"}${paymentProof ? ` · comprobante adjuntado a ${attached} gasto(s)` : ""}`,
      );
    if (failed)
      toast.error(
        `${failed} ${failed === 1 ? "gasto no pudo marcarse" : "gastos no pudieron marcarse"} como pagado`,
      );
    if (attachmentFailed)
      toast.error(
        `No se pudo adjuntar el comprobante a ${attachmentFailed} gasto(s)`,
      );
    setSelectedExpenses(new Set());
    setPaymentProof(null);
    setPaymentProofKind("boleta");
    setConfirmPayment(false);
    setPayingSelected(false);
  };

  const totals = totalsOf(cardExpenses);

  const groupKey = (expense: CreditCardExpense, field: string) => {
    if (field === "category") return expense.categoryId ?? "none";
    if (field === "currency") return expense.currency || "PEN";
    if (field === "person") return expense.personId;
    if (field === "installments")
      return expense.installment ? "cuotas" : "sin-cuotas";
    return "none";
  };
  const groupLabel = (key: string, field: string) => {
    if (field === "category")
      return key === "none" ? "Sin categoría" : categoryName(key);
    if (field === "currency")
      return key === "USD"
        ? "Dólares (USD)"
        : key === "PEN"
          ? "Soles (PEN)"
          : key;
    if (field === "person") return personName(key);
    if (field === "installments")
      return key === "cuotas" ? "En cuotas" : "Sin cuotas";
    return key;
  };

  const columns: Column<CreditCardExpense>[] = [
    {
      key: "description",
      header: "Descripción",
      role: "title",
      cell: (exp) => (
        <div>
          <span className="font-medium">{exp.description}</span>
          {exp.installment && (
            <Badge variant="outline" className="ml-2 text-xs">
              {exp.installment}
            </Badge>
          )}
          {exp.notes && (
            <p className="text-xs text-muted-foreground">{exp.notes}</p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      role: "amount",
      cell: (exp) => (
        <CurrencyDisplay
          amount={exp.amount}
          currency={exp.currency}
          amountInPEN={exp.amountInPen}
          othersShare={exp.othersShare}
        />
      ),
    },
    {
      key: "category",
      header: "Categoría",
      cell: (exp) => (
        <span className="text-sm">{categoryName(exp.categoryId)}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (exp) => (
        <Select
          value={exp.paymentStatus}
          onValueChange={(v) =>
            saveExpense.mutate({
              id: exp.id,
              body: { paymentStatus: v },
            })
          }
        >
          <SelectTrigger className="h-7 w-auto border-0 p-0">
            <StatusBadge status={exp.paymentStatus} />
          </SelectTrigger>
          <SelectContent>
            {CREDIT_CARD_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                <StatusBadge status={status} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "person",
      header: "Persona",
      cell: (exp) => (
        <span className="text-sm">{personName(exp.personId)}</span>
      ),
    },
    {
      key: "date",
      header: "Fecha",
      cell: (exp) => (
        <span className="text-sm text-muted-foreground">
          {exp.processDate ? formatDate(exp.processDate) : "—"}
        </span>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      cell: (exp) => (
        <Badge
          variant={exp.expenseType === "essential" ? "default" : "secondary"}
          className="text-xs"
        >
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
          onDuplicate={() =>
            saveExpense.mutate({
              body: duplicateBody(EXPENSE_RESOURCES.creditCard, exp),
            })
          }
          onNextMonth={() =>
            saveExpense.mutate({ id: exp.id, body: nextMonthBody(exp) })
          }
          onDelete={() => deleteExpense.mutate(exp.id)}
          status={{
            value: exp.paymentStatus,
            options: CREDIT_CARD_STATUSES,
            onChange: (paymentStatus) =>
              saveExpense.mutate({
                id: exp.id,
                body: {
                  paymentStatus,
                },
              }),
          }}
        />
      ),
    },
  ];

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground">
        {cardExpenses.length} {cardExpenses.length === 1 ? "gasto" : "gastos"}
      </span>
      <div className="text-right">
        <span className="text-sm font-semibold">
          Total: {formatCurrency(totals.paid)}
        </span>
        <OwnPart {...totals} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <CardDetailHeader
        name={card.name}
        color={card.color}
        movementCount={ofCard.length}
        month={selectedMonth}
        year={selectedYear}
        onNewExpense={() =>
          openNewExpense({
            destination: "credit_card",
            paymentMethodId: card.id,
          })
        }
        onRegisterPayment={() => setConfirmPayment(true)}
        onEdit={() => setEditingCard(true)}
        canRegisterPayment={selectedPending.length > 0}
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        className="w-full"
      >
        <TabsList
          aria-label="Secciones del detalle de tarjeta"
          className="grid h-auto w-full grid-cols-3 bg-transparent p-0 sm:flex sm:w-fit"
        >
          <TabsTrigger
            value="expenses"
            className="h-auto whitespace-normal py-2 text-xs sm:text-sm"
          >
            <List aria-hidden="true" /> Movimientos
          </TabsTrigger>
          <TabsTrigger
            value="card-detail"
            className="h-auto whitespace-normal py-2 text-xs sm:text-sm"
          >
            <ChartPie aria-hidden="true" /> Categorías
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="h-auto whitespace-normal py-2 text-xs sm:text-sm"
          >
            <Wallet aria-hidden="true" /> Pago de tarjeta
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <CardDetailMetrics
            view={activeTab}
            month={selectedMonth}
            year={selectedYear}
            amount={ofCard.reduce(
              (sum, expense) => sum + (expense.amountInPen ?? expense.amount),
              0,
            )}
            categories={activeCategories.length}
            largestCategory={
              largestCategoryId
                ? categoryName(
                    largestCategoryId === "none" ? null : largestCategoryId,
                  )
                : "—"
            }
            statement={statementDetail}
          />
        </div>

        <TabsContent value="expenses" className="mt-3 space-y-3">
          <ExpenseFilters
            fields={[...CARD_DETAIL_FILTER_KEYS]}
            value={filters}
            onChange={setFilters}
            statuses={CREDIT_CARD_STATUSES}
            shown={cardExpenses.length}
            total={ofCard.length}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            groupByOptions={[...CARD_DETAIL_GROUP_OPTIONS]}
            showActiveSummary={false}
            appliedFilters={
              <ActiveExpenseFilterChips
                fields={[...CARD_DETAIL_FILTER_KEYS]}
                value={filters}
                onChange={setFilters}
                me={me}
              />
            }
            viewToggle={<ViewToggle value={view} onChange={setView} />}
          />

          {cardExpenses.length === 0 ? (
            <EmptyState
              description={
                ofCard.length
                  ? "No hay gastos con estos filtros"
                  : "No hay gastos registrados para esta tarjeta"
              }
            />
          ) : (
            <GroupedDataView
              items={cardExpenses}
              columns={columns}
              rowKey={(exp) => exp.id}
              view={view}
              groupBy={groupBy}
              groupKey={groupKey}
              groupLabel={groupLabel}
              footer={footer}
              selected={selectedExpenses}
              onSelectedChange={setSelectedExpenses}
            />
          )}
        </TabsContent>

        <TabsContent value="card-detail" className="mt-3">
          <CardCategoryBreakdown expenses={ofCard} />
        </TabsContent>

        <TabsContent value="payment" className="mt-3">
          {statementDetail ? (
            <div className="space-y-4 rounded-lg border p-3 sm:p-4">
              <StatementBalanceSummary statement={statementDetail} />
              <StatementPaymentSummary statement={statementDetail} />
              <div className="grid gap-3 lg:grid-cols-2">
                <StatementMinimumCard
                  paymentMethodId={card.id}
                  cardName={card.name}
                  month={selectedMonth}
                  year={selectedYear}
                />
                <StatementTotalCard
                  key={`${card.id}-${selectedYear}-${selectedMonth}`}
                  initialCurrency={
                    statementDetail.currency === "USD" ? "USD" : "PEN"
                  }
                  paymentMethodId={card.id}
                  cardName={card.name}
                  month={selectedMonth}
                  year={selectedYear}
                  compact
                />
              </div>
            </div>
          ) : (
            <EmptyState
              title="Sin estado de cuenta"
              description="Carga el PDF de este período para ver el detalle por moneda y calcular el pago total."
            />
          )}
        </TabsContent>
      </Tabs>

      <ExpenseEditDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(undefined)}
        resource={EXPENSE_RESOURCES.creditCard}
        expense={editing}
      />
      {editingCard && (
        <CardEditorDialog card={card} onClose={() => setEditingCard(false)} />
      )}

      <AlertDialog
        open={confirmPayment}
        onOpenChange={(open) => {
          setConfirmPayment(open);
          if (!open && !payingSelected) {
            setPaymentProof(null);
            setPaymentProofKind("boleta");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar pago</AlertDialogTitle>
            <AlertDialogDescription>
              Se marcarán como pagados {selectedPending.length}{" "}
              {selectedPending.length === 1
                ? "gasto seleccionado"
                : "gastos seleccionados"}{" "}
              de {card.name}. El comprobante es opcional.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <label className="space-y-1.5 text-sm">
              <span>Tipo de comprobante</span>
              <Select
                value={paymentProofKind}
                onValueChange={(value) =>
                  setPaymentProofKind(value as Attachment["kind"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ATTACHMENT_KIND_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
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
                {paymentProof
                  ? `${paymentProof.name} · se adjuntará a cada gasto pagado`
                  : "Opcional · imagen, PDF o documento de hasta 15 MB. Se adjuntará a cada gasto pagado."}
              </span>
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={payingSelected}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={payingSelected || selectedPending.length === 0}
              onClick={(event) => {
                event.preventDefault();
                void registerSelectedPayment();
              }}
            >
              {payingSelected
                ? paymentProof
                  ? "Guardando y adjuntando…"
                  : "Guardando…"
                : "Confirmar pago"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const CreditCardDetail = withQuery(CreditCardDetailView);
