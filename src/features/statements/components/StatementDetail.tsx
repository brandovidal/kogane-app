import { StatementBalanceSummary } from "./StatementBalanceSummary";
import { StatementPaymentSummary } from "./StatementPaymentSummary";
import { StatementBalanceHistory } from "./StatementBalanceHistory";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  CirclePlus,
  ListFilter,
  Replace,
  Wallet,
} from "lucide-react";

import { nameById, usePeople } from "@/shared/api/hooks/catalogs";
import { useExpense } from "@/features/expenses/hooks/expenses";
import { useStatements } from "@/features/statements/hooks/statements";
import {
  useAssignStatementCard,
  useAssignStatementPerson,
  useAssignStatementRows,
  useCreateStatementRows,
  useUpdateStatementRow,
} from "@/features/statements/hooks/statements";
import { PersonSelect } from "@/features/settings/components/PersonSelect";
import { PaymentMethodSelect } from "@/features/settings/components/PaymentMethodSelect";
import {
  EXPENSE_RESOURCES,
  type Statement,
  type StatementRow,
} from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate, getMonthName } from "@/shared/lib/dates";
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
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import {
  confirmCreateText,
  countsOf,
  ROW_RESULT_LABELS,
  rowName,
  rowsOf,
  totalsOf,
} from "@/features/statements/lib/statement-view";
import { EditRowDialog } from "./EditRowDialog";
import { StatementRowActions } from "./StatementRowActions";
import { StatementMatchDialog } from "./StatementMatchDialog";
import { MissingExpenseActions } from "./MissingExpenseActions";
import { ExpenseEditDialog } from "@/features/expenses/components/ExpenseEditDialog";
import { StatementTotalCard } from "@/features/credit-cards/components/StatementTotalCard";
import { DataTableBasic } from "@/shared/components/data-display/DataTableBasic";
import { useDataTable } from "@/shared/hooks/useDataTable";

interface PendingCreate {
  rowIds?: string[];
  title: string;
  description: string;
}

// A purchase of someone else on the owner's card becomes their cobro when it is saved (D116)
const isCollect = (row: StatementRow, statementPersonId: string | null) =>
  !!row.debtId ||
  (row.result !== "matched" &&
    row.result !== "created" &&
    !!row.personId &&
    row.personId !== statementPersonId);

function RowsTable({
  statementId,
  statementPersonId,
  rows,
  onCreate,
  onReview,
}: {
  statementId: string;
  statementPersonId: string | null;
  rows: StatementRow[];
  onCreate: (row: StatementRow) => void;
  onReview: (row: StatementRow) => void;
}) {
  const update = useUpdateStatementRow();
  const assignRows = useAssignStatementRows();
  const [editingRow, setEditingRow] = useState<StatementRow | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignTo, setAssignTo] = useState<string | null>(null);
  const personName = nameById(usePeople().data);
  // Matched and created rows follow the person of their expense: only the others can be given to someone
  const selectable = rows.filter(
    (row) => (row.result === "new" || row.result === "ignored") && !row.locked,
  );
  const allChecked =
    selectable.length > 0 && selectable.every((row) => selected.has(row.id));
  const toggle = (id: string, on: boolean) => {
    const next = new Set(selected);
    if (on) next.add(id);
    else next.delete(id);
    setSelected(next);
  };
  const assign = () =>
    assignRows.mutate(
      { id: statementId, rowIds: [...selected], personId: assignTo },
      { onSuccess: () => (setSelected(new Set()), setAssignTo(null)) },
    );

  const columns = useMemo<ColumnDef<StatementRow>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: () => (
          <Checkbox
            aria-label="Seleccionar todas"
            disabled={!selectable.length}
            checked={
              allChecked ? true : selected.size ? "indeterminate" : false
            }
            onCheckedChange={(on) =>
              setSelected(
                on === true
                  ? new Set(selectable.map((row) => row.id))
                  : new Set(),
              )
            }
          />
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <Checkbox
              aria-label="Seleccionar"
              disabled={
                item.locked ||
                item.result === "matched" ||
                item.result === "created"
              }
              checked={selected.has(item.id)}
              onCheckedChange={(on) => toggle(item.id, on === true)}
            />
          );
        },
        meta: { className: "w-[36px]" },
      },
      {
        id: "date",
        accessorFn: (row) => row.date ?? "",
        header: "Fecha",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.date ? formatDate(row.original.date) : "—"}
          </span>
        ),
        meta: { label: "Fecha" },
      },
      {
        id: "description",
        accessorFn: rowName,
        header: "Descripción",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="min-w-56">
              {item.expenseId ? (
                <button
                  type="button"
                  className="text-left font-medium underline decoration-muted-foreground/40 underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Revisar registro de ${rowName(item)}`}
                  onClick={() => onReview(item)}
                >
                  {rowName(item)}
                </button>
              ) : (
                <span>{rowName(item)}</span>
              )}
              {item.installment && (
                <Badge variant="outline" className="ml-2">
                  {item.installment}
                </Badge>
              )}
              {item.label && (
                <p className="text-xs text-muted-foreground">
                  Banco: {item.description}
                </p>
              )}
            </div>
          );
        },
        meta: { label: "Descripción" },
      },
      {
        id: "amount",
        accessorFn: (row) => row.amount,
        header: "Monto",
        cell: ({ row }) => (
          <span className="tabular-nums">
            {formatCurrency(row.original.amount, row.original.currency)}
          </span>
        ),
        meta: { label: "Monto", className: "text-right" },
      },
      {
        id: "person",
        accessorFn: (row) => (row.personId ? personName(row.personId) : ""),
        header: "Persona",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <span className="whitespace-nowrap text-sm">
              {item.personId ? personName(item.personId) : "—"}
              {isCollect(item, statementPersonId) && (
                <Badge
                  variant="outline"
                  className="ml-2 text-[10px]"
                  title="Al guardarlo se crea su cobro"
                >
                  {item.debtId ? "cobro creado" : "se cobra"}
                </Badge>
              )}
            </span>
          );
        },
        meta: { label: "Persona" },
      },
      {
        id: "status",
        accessorFn: (row) => ROW_RESULT_LABELS[row.result],
        header: "Estado",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {ROW_RESULT_LABELS[row.original.result]}
          </span>
        ),
        meta: { label: "Estado" },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <StatementRowActions
              row={item}
              onEdit={() => setEditingRow(item)}
              onSave={() =>
                item.expenseId && item.result === "matched"
                  ? onReview(item)
                  : onCreate(item)
              }
              onReview={item.expenseId ? () => onReview(item) : undefined}
              onIgnore={() =>
                update.mutate({
                  id: statementId,
                  rowId: item.id,
                  result: "ignored",
                })
              }
              onRestore={() =>
                update.mutate({
                  id: statementId,
                  rowId: item.id,
                  result: "new",
                })
              }
              saving={update.isPending}
            />
          );
        },
        meta: { label: "Acciones", className: "text-right" },
      },
    ],
    [
      allChecked,
      onCreate,
      onReview,
      personName,
      selectable,
      selected,
      statementId,
      statementPersonId,
      update,
    ],
  );
  const dataTable = useDataTable({
    items: rows,
    columns,
    rowKey: (row) => row.id,
    paginationEnabled: false,
  });

  return (
    <>
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-2 text-sm">
          <span className="px-1 font-medium">
            {selected.size} seleccionadas · Asignar a
          </span>
          <div className="w-48">
            <PersonSelect
              value={assignTo}
              onChange={setAssignTo}
              placeholder="Elige la persona"
            />
          </div>
          <Button
            size="sm"
            onClick={assign}
            disabled={!assignTo || assignRows.isPending}
          >
            Asignar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            Quitar selección
          </Button>
        </div>
      )}
      <div className="overflow-x-auto">
        <DataTableBasic
          table={dataTable}
          rowClassName={(row) =>
            row.result === "ignored" ? "opacity-60" : undefined
          }
          rowIsSelected={(row) => selected.has(row.id)}
        />
      </div>

      {editingRow && (
        <EditRowDialog
          key={editingRow.id}
          row={editingRow}
          onClose={() => setEditingRow(null)}
          onSave={(changes) =>
            update.mutate(
              { id: statementId, rowId: editingRow.id, ...changes },
              { onSuccess: () => setEditingRow(null) },
            )
          }
          saving={update.isPending}
        />
      )}
    </>
  );
}

// A statement read (P14, D95): what it already has, what is new and what is only in Kogane. Every row can be renamed,
// saved (also a matched or ignored one: same names can be another month or card, the user decides) or ignored
// The sum of a tab, in soles and in dollars apart
function TabTotals({
  items,
}: {
  items: { amount: number; currency?: string | null }[];
}) {
  const totals = totalsOf(items);
  if (!totals.length) return null;
  return (
    <span className="text-sm text-muted-foreground">
      Suma:{" "}
      {totals.map((total, index) => (
        <span key={total.currency}>
          {index > 0 && " · "}
          <span className="font-medium tabular-nums text-foreground">
            {formatCurrency(total.amount, total.currency)}
          </span>
        </span>
      ))}
    </span>
  );
}

export function StatementDetail({
  statement,
  onChangeFile,
}: {
  statement: Statement;
  onChangeFile?: () => void;
}) {
  const createRows = useCreateStatementRows();
  const [pending, setPending] = useState<PendingCreate | null>(null);
  const assignPerson = useAssignStatementPerson();
  const assignCard = useAssignStatementCard();
  const personName = nameById(usePeople().data);
  const statementHistory = useStatements().data ?? [];
  const [editingExpenseId, setEditingExpenseId] = useState<string>();
  const { data: editingExpense } = useExpense(
    EXPENSE_RESOURCES.creditCard,
    editingExpenseId,
  );
  const [tab, setTab] = useState<string | null>(null);
  const [reviewingRowId, setReviewingRowId] = useState<string | null>(null);
  const reviewingRow = statement.rows.find((row) => row.id === reviewingRowId);
  const reviewRow = (row: StatementRow) => setReviewingRowId(row.id);
  const openExpense = (expenseId: string) => setEditingExpenseId(expenseId);
  const counts = countsOf(statement);
  const newRows = rowsOf(statement, "new");
  const matchedRows = rowsOf(statement, "matched");
  const activeTab =
    tab ??
    (counts.new || statement.rows.some((row) => row.locked)
      ? "new"
      : "matched");
  const where = `${statement.cardName} · ${getMonthName(statement.paymentMonth)} ${statement.paymentYear}`;
  const history = statementHistory
    .filter(
      (item) =>
        item.paymentMethodId === statement.paymentMethodId &&
        (item.paymentYear < statement.paymentYear ||
          (item.paymentYear === statement.paymentYear &&
            item.paymentMonth < statement.paymentMonth)),
    )
    .sort(
      (a, b) =>
        b.paymentYear - a.paymentYear || b.paymentMonth - a.paymentMonth,
    )
    .slice(0, 4);

  const collectFrom = (row: StatementRow) =>
    row.personId && row.personId !== statement.personId
      ? personName(row.personId)
      : undefined;
  const askCreate = (row: StatementRow) =>
    setPending({
      rowIds: [row.id],
      ...confirmCreateText(row, where, collectFrom(row)),
    });
  const newCollects = newRows.filter(
    (row) => row.result === "new" && collectFrom(row),
  ).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex min-w-0 flex-wrap items-center gap-2 text-base">
          <span className="min-w-0 truncate whitespace-nowrap" title={where}>
            {where}
          </span>
          <Badge variant="outline" className="shrink-0 whitespace-nowrap">
            {statement.source === "ai" ? "Leído con AI" : "Leído sin AI"}
          </Badge>
          <Badge variant="secondary" className="shrink-0 whitespace-nowrap">
            Pagar hasta{" "}
            {statement.dueDate ? formatDate(statement.dueDate) : "sin fecha"}
          </Badge>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex max-w-sm items-center gap-2 text-sm">
            <span className="shrink-0 text-muted-foreground">Persona</span>
            <PersonSelect
              value={statement.personId}
              onChange={(personId) =>
                personId && assignPerson.mutate({ id: statement.id, personId })
              }
              placeholder="Sin asignar"
            />
          </div>
          <div
            className="flex max-w-sm items-center gap-2 text-sm"
            title="¿La tarjeta no es la correcta? Cámbiala aquí: los movimientos que aún no creaste se comparan de nuevo con esa tarjeta."
          >
            <span className="shrink-0 text-muted-foreground">Tarjeta</span>
            <PaymentMethodSelect
              type="credit_card"
              value={statement.paymentMethodId}
              onChange={(paymentMethodId) =>
                paymentMethodId &&
                assignCard.mutate({ id: statement.id, paymentMethodId })
              }
              placeholder="Elige la tarjeta"
            />
          </div>
          {onChangeFile && (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={onChangeFile}
            >
              <Replace className="size-4" /> Cambiar archivo
            </Button>
          )}
        </div>
        <StatementBalanceSummary statement={statement} />
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setTab}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsList
              aria-label="Revisión del estado de cuenta"
              className="grid w-full grid-cols-2 group-data-[orientation=horizontal]/tabs:h-auto sm:flex sm:w-fit"
            >
              {(
                [
                  ["new", CirclePlus, "Nuevos", counts.new],
                  ["matched", CheckCircle2, "Coinciden", counts.matched],
                  ["missing", ListFilter, "Solo en Kogane", counts.missing],
                  ["total", Wallet, "Pago total", null],
                ] as const
              ).map(([value, Icon, label, count]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="h-auto gap-1.5 whitespace-normal py-2 sm:whitespace-nowrap"
                >
                  <Icon aria-hidden="true" /> {label}
                  {count != null && (
                    <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex flex-wrap items-center gap-3">
              {activeTab === "new" && (
                <TabTotals
                  items={newRows.filter((row) => row.result === "new")}
                />
              )}
              {activeTab === "matched" && <TabTotals items={matchedRows} />}
              {activeTab === "missing" && (
                <TabTotals items={statement.missing} />
              )}
              {activeTab === "new" && counts.new > 0 && (
                <Button
                  size="sm"
                  onClick={() =>
                    setPending({
                      title: `¿Guardar los ${counts.new} nuevos?`,
                      description: `Se crean como gastos pendientes de ${where}, con el nombre que les diste (o el del banco) y a nombre de su persona.${newCollects ? ` ${newCollects} son de otras personas: también se crea su cobro.` : ""} Los ignorados no se guardan.`,
                    })
                  }
                  disabled={createRows.isPending}
                >
                  Guardar todos ({counts.new})
                </Button>
              )}
            </div>
          </div>

          <TabsContent
            value="total"
            forceMount
            className="mt-3 data-[state=inactive]:hidden"
          >
            <p className="mb-2 text-sm text-muted-foreground">
              Pago total menos el pago actual = pago restante
            </p>
            <StatementPaymentSummary statement={statement} />
            <div className="mb-4">
              <StatementTotalCard
                key={statement.id}
                initialCurrency={statement.currency === "USD" ? "USD" : "PEN"}
                paymentMethodId={statement.paymentMethodId}
                cardName={statement.cardName}
                month={statement.paymentMonth}
                year={statement.paymentYear}
                compact
              />
            </div>
            <StatementBalanceHistory history={history} />
          </TabsContent>

          <TabsContent value="new" className="mt-3 space-y-3">
            {newRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todo lo del estado de cuenta ya está registrado.
              </p>
            ) : (
              <RowsTable
                statementId={statement.id}
                statementPersonId={statement.personId}
                rows={newRows}
                onCreate={askCreate}
                onReview={reviewRow}
              />
            )}
          </TabsContent>

          <TabsContent value="matched" className="mt-3 space-y-2">
            {matchedRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nada coincidió todavía.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Misma tarjeta y moneda, mes del estado y anterior. Pulsa la
                  descripción para revisar la coincidencia.
                </p>
                <RowsTable
                  statementId={statement.id}
                  statementPersonId={statement.personId}
                  rows={matchedRows}
                  onCreate={askCreate}
                  onReview={reviewRow}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="missing" className="mt-3 space-y-2">
            {statement.missing.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todo lo registrado para esta tarjeta y mes está en el estado de
                cuenta.
              </p>
            ) : (
              <>
                <p className="mb-2 text-sm text-muted-foreground">
                  Registrados en Kogane pero ausentes del estado. Si reconoces
                  uno entre los nuevos con otro nombre, revísalo antes de
                  guardar.
                </p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Persona</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statement.missing.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {expense.processDate
                              ? formatDate(expense.processDate)
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {expense.description}{" "}
                            {expense.installment && (
                              <Badge variant="outline">
                                {expense.installment}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(expense.amount, expense.currency)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {personName(expense.personId)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="border-amber-500/40 text-amber-600"
                            >
                              No aparece en el PDF
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <MissingExpenseActions
                              expenseName={expense.description}
                              onEdit={() => openExpense(expense.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending)
                  createRows.mutate({
                    id: statement.id,
                    rowIds: pending.rowIds,
                  });
                setPending(null);
              }}
            >
              Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {reviewingRow && (
        <StatementMatchDialog
          key={reviewingRow.id}
          statement={statement}
          row={reviewingRow}
          onClose={() => setReviewingRowId(null)}
          onEdit={openExpense}
          onCreate={askCreate}
        />
      )}
      <ExpenseEditDialog
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpenseId(undefined)}
        resource={EXPENSE_RESOURCES.creditCard}
        expense={editingExpense}
      />
    </Card>
  );
}
