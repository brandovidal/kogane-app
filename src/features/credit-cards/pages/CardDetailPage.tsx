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
import { useViewMode } from "@/shared/hooks/useViewMode";
import { type Column } from "@/shared/types/data-view";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { useEffect, useState } from "react";
import { CardSummaryPanel } from "../components/CardSummaryPanel";
import { tabFromSearch } from "../lib/card-links";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChartPie, LayoutGrid, List, Wallet } from "lucide-react";
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
import { CardDetailToolbar } from "../sections/detail/CardDetailToolbar";
import { CardEditorDialog } from "../components/CardEditorDialog";
import type { ColumnVisibilityOption } from "@/shared/components/toolbar";
import { cardHeaderStore } from "../stores/card-header.store";
import { CategoryLabel } from "@/features/categories/components/CategoryLabel";
import { NameAvatar } from "@/shared/components/data-display/NameAvatar";

import {
  CARD_DETAIL_FILTER_KEYS,
  type CardDetailGroupBy,
} from "../constants/filters";

interface CreditCardDetailProps {
  cardCode: string;
}

const EMPTY_CARD_EXPENSES: CreditCardExpense[] = [];

// The card is a payment method of type credit_card (D62); the URL uses its code (CMR, IO…) or its id
function CreditCardDetailView({ cardCode }: CreditCardDetailProps) {
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const { data: creditCards, isLoading } = useCreditCards();
  const expensesQuery = useExpenses(EXPENSE_RESOURCES.creditCard, {
    month: selectedMonth,
    year: selectedYear,
  });
  const expenses = expensesQuery.data ?? EMPTY_CARD_EXPENSES;
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
  const [groupBy, setGroupBy] = useState<CardDetailGroupBy[]>([]);
  const [sort, setSort] = useState<string | undefined>("date-desc");
  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<string[]>([]);
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
    "summary" | "expenses" | "card-detail" | "payment"
  >("summary");
  const [editingCard, setEditingCard] = useState(false);
  useEffect(() => {
    const tab = tabFromSearch(window.location.search);
    if (tab) setActiveTab(tab);
  }, []);

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
  useEffect(() => {
    cardHeaderStore
      .getState()
      .setTitle(
        card ? `Movimientos · ${card.code ?? card.name}` : "Movimientos",
      );
    if (isLoading || expensesQuery.isLoading) {
      cardHeaderStore.getState().setCount(null);
      return;
    }
    cardHeaderStore
      .getState()
      .setCount(
        card
          ? expenses.filter((expense) => expense.paymentMethodId === card.id)
              .length
          : 0,
      );
  }, [card, expenses, expensesQuery.isLoading, isLoading]);
  if (isLoading) return null;
  if (!card) return <EmptyState title="Tarjeta no encontrada" />;

  const ofCard = expenses.filter((e) => e.paymentMethodId === card.id);
  const cardExpenses = applyExpenseFilters(ofCard, filters, me).sort((a, b) => {
    if (sort === "date-asc")
      return (a.processDate ?? "").localeCompare(b.processDate ?? "");
    if (sort === "amount-desc")
      return (b.amountInPen ?? b.amount) - (a.amountInPen ?? a.amount);
    if (sort === "amount-asc")
      return (a.amountInPen ?? a.amount) - (b.amountInPen ?? b.amount);
    if (sort === "description-asc")
      return a.description.localeCompare(b.description, "es");
    if (sort === "date-desc")
      return (b.processDate ?? "").localeCompare(a.processDate ?? "");
    return 0;
  });
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
      key: "category",
      header: "Categoría",
      cell: (exp) => {
        const category = categories.find((item) => item.id === exp.categoryId);
        return (
          <CategoryLabel
            name={category?.name ?? "Sin categoría"}
            icon={category?.icon}
            color={category?.color}
            className="text-sm"
          />
        );
      },
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
      key: "status",
      header: "Estado",
      cell: (exp) => <StatusBadge status={exp.paymentStatus} />,
    },
    {
      key: "person",
      header: "Persona",
      cell: (exp) => {
        const name = personName(exp.personId);
        return (
          <span className="inline-flex items-center gap-2 text-sm">
            <NameAvatar name={name} unassigned={!exp.personId} />
            {name}
          </span>
        );
      },
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

  const hideableColumns = columns.filter((column) => column.role !== "actions");
  const columnVisibilityOptions: ColumnVisibilityOption[] = hideableColumns.map(
    (column) => ({
      id: column.key,
      label: column.header,
      visible: !hiddenColumnKeys.includes(column.key),
      onVisibleChange: (visible) =>
        setHiddenColumnKeys((current) =>
          visible
            ? current.filter((key) => key !== column.key)
            : [...new Set([...current, column.key])],
        ),
    }),
  );
  const visibleColumns = columns.filter(
    (column) =>
      column.role === "actions" || !hiddenColumnKeys.includes(column.key),
  );
  const resetView = () => {
    setFilters({});
    setGroupBy([]);
    setSort("date-desc");
    setHiddenColumnKeys([]);
    setView("table");
  };

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
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        className="w-full"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList
            aria-label="Secciones del detalle de tarjeta"
            className="flex h-auto w-full min-w-0 items-center justify-start gap-1 overflow-x-auto bg-transparent p-0 [scrollbar-width:none] sm:w-fit"
          >
            <TabsTrigger
              value="summary"
              className="h-auto shrink-0 whitespace-nowrap py-2 text-xs sm:text-sm"
            >
              <LayoutGrid aria-hidden="true" /> Resumen
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="h-auto shrink-0 whitespace-nowrap py-2 text-xs sm:text-sm"
            >
              <List aria-hidden="true" /> Movimientos
            </TabsTrigger>
            <TabsTrigger
              value="card-detail"
              className="h-auto shrink-0 whitespace-nowrap py-2 text-xs sm:text-sm"
            >
              <ChartPie aria-hidden="true" /> Categorías
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="h-auto shrink-0 whitespace-nowrap py-2 text-xs sm:text-sm"
            >
              <Wallet aria-hidden="true" /> Pago de tarjeta
            </TabsTrigger>
          </TabsList>
          <CardDetailHeader
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
        </div>

        <div className="mt-4">
          <CardDetailMetrics
            view={activeTab}
            month={selectedMonth}
            year={selectedYear}
            movementCount={ofCard.length}
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
            closeDay={card.billingCloseDay}
            creditLimit={card.creditLimit}
          />
        </div>

        <TabsContent value="summary" className="mt-3">
          <CardSummaryPanel
            expenses={ofCard}
            statement={statementDetail}
            month={selectedMonth}
            year={selectedYear}
            payDay={card.paymentDueDay}
            closeDay={card.billingCloseDay}
            categoryName={categoryName}
            personName={personName}
            onSeeAll={() => setActiveTab("expenses")}
            onSeeCategories={() => setActiveTab("card-detail")}
            onRegisterPayment={() => setActiveTab("payment")}
          />
        </TabsContent>

        <TabsContent value="expenses" className="mt-3 space-y-3">
          <CardDetailToolbar
            fields={CARD_DETAIL_FILTER_KEYS}
            filters={filters}
            onFiltersChange={setFilters}
            shown={cardExpenses.length}
            total={ofCard.length}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            sort={sort}
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
            columns={columnVisibilityOptions}
            onResetView={resetView}
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
              columns={visibleColumns}
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
