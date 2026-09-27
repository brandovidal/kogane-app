import { StatementBalanceSummary } from "./StatementBalanceSummary";
import { StatementPaymentSummary } from "./StatementPaymentSummary";
import { StatementBalanceHistory } from "./StatementBalanceHistory";
import { useState } from "react";
import { CheckCircle2, CirclePlus, ListFilter, Wallet } from "lucide-react";

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
} from "@/features/statements/lib/statement-view";
import { EditRowDialog } from "./EditRowDialog";
import { StatementRowActions } from "./StatementRowActions";
import { StatementMatchDialog } from "./StatementMatchDialog";
import { MissingExpenseActions } from "./MissingExpenseActions";
import { ExpenseEditDialog } from "@/features/expenses/components/ExpenseEditDialog";
import { StatementTotalCard } from "@/features/credit-cards/components/StatementTotalCard";

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[36px]">
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
              </TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Persona</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className={row.result === "ignored" ? "opacity-60" : ""}
                data-state={selected.has(row.id) ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    aria-label="Seleccionar"
                    disabled={
                      row.locked ||
                      row.result === "matched" ||
                      row.result === "created"
                    }
                    checked={selected.has(row.id)}
                    onCheckedChange={(on) => toggle(row.id, on === true)}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {row.date ? formatDate(row.date) : "—"}
                </TableCell>
                <TableCell className="min-w-56">
                  <div>
                    {row.expenseId ? (
                      <button
                        type="button"
                        className="text-left font-medium underline decoration-muted-foreground/40 underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Revisar registro de ${rowName(row)}`}
                        onClick={() => onReview(row)}
                      >
                        {rowName(row)}
                      </button>
                    ) : (
                      <span>{rowName(row)}</span>
                    )}
                    {row.installment && (
                      <Badge variant="outline" className="ml-2">
                        {row.installment}
                      </Badge>
                    )}
                    {row.label && (
                      <p className="text-xs text-muted-foreground">
                        Banco: {row.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.amount, row.currency)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {row.personId ? personName(row.personId) : "—"}
                  {isCollect(row, statementPersonId) && (
                    <Badge
                      variant="outline"
                      className="ml-2 text-[10px]"
                      title="Al guardarlo se crea su cobro"
                    >
                      {row.debtId ? "cobro creado" : "se cobra"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {ROW_RESULT_LABELS[row.result]}
                </TableCell>
                <TableCell className="text-right">
                  <StatementRowActions
                    row={row}
                    onEdit={() => setEditingRow(row)}
                    onSave={() =>
                      row.expenseId && row.result === "matched"
                        ? onReview(row)
                        : onCreate(row)
                    }
                    onReview={row.expenseId ? () => onReview(row) : undefined}
                    onIgnore={() =>
                      update.mutate({
                        id: statementId,
                        rowId: row.id,
                        result: "ignored",
                      })
                    }
                    onRestore={() =>
                      update.mutate({
                        id: statementId,
                        rowId: row.id,
                        result: "new",
                      })
                    }
                    saving={update.isPending}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
export function StatementDetail({ statement }: { statement: Statement }) {
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
  const [reviewingRowId, setReviewingRowId] = useState<string | null>(null);
  const reviewingRow = statement.rows.find((row) => row.id === reviewingRowId);
  const reviewRow = (row: StatementRow) => setReviewingRowId(row.id);
  const openExpense = (expenseId: string) => setEditingExpenseId(expenseId);
  const counts = countsOf(statement);
  const newRows = rowsOf(statement, "new");
  const matchedRows = rowsOf(statement, "matched");
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
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {where}
          <Badge variant="outline">
            {statement.source === "ai" ? "Leído con AI" : "Leído sin AI"}
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
          <div className="flex max-w-sm items-center gap-2 text-sm">
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
        </div>
        <p className="text-xs text-muted-foreground">
          ¿La tarjeta no es la correcta? Cámbiala aquí: los movimientos que aún
          no creaste se comparan de nuevo con esa tarjeta.
        </p>
        <StatementBalanceSummary statement={statement} />
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={
            counts.new || statement.rows.some((row) => row.locked)
              ? "new"
              : "matched"
          }
        >
          <TabsList
            aria-label="Revisión del estado de cuenta"
            className="grid w-full grid-cols-2 group-data-[orientation=horizontal]/tabs:h-auto sm:flex sm:w-fit"
          >
            <TabsTrigger
              value="new"
              className="h-auto whitespace-normal py-2 sm:whitespace-nowrap"
            >
              <CirclePlus aria-hidden="true" /> Nuevos ({counts.new})
            </TabsTrigger>
            <TabsTrigger
              value="matched"
              className="h-auto whitespace-normal py-2 sm:whitespace-nowrap"
            >
              <CheckCircle2 aria-hidden="true" /> Coinciden ({counts.matched})
            </TabsTrigger>
            <TabsTrigger
              value="missing"
              className="h-auto whitespace-normal py-2 sm:whitespace-nowrap"
            >
              <ListFilter aria-hidden="true" /> Solo en Kogane ({counts.missing}
              )
            </TabsTrigger>
            <TabsTrigger
              value="total"
              className="h-auto whitespace-normal py-2 sm:whitespace-nowrap"
            >
              <Wallet aria-hidden="true" /> Pago total
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="total"
            forceMount
            className="mt-3 data-[state=inactive]:hidden"
          >
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
            <StatementBalanceHistory statement={statement} history={history} />
          </TabsContent>

          <TabsContent value="new" className="mt-3 space-y-3">
            {counts.new > 0 && (
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
                  Movimientos del PDF vinculados a un gasto existente o creado
                  desde este estado. La comparación considera la misma tarjeta y
                  moneda, en el mes del estado y el anterior. Pulsa la
                  descripción o «Revisar coincidencia» para comparar el mes de
                  pago, la fecha y la cuota antes de crear otro gasto.
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

          <TabsContent value="missing" className="mt-3">
            {statement.missing.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todo lo registrado para esta tarjeta y mes está en el estado de
                cuenta.
              </p>
            ) : (
              <>
                <p className="mb-2 text-sm text-muted-foreground">
                  Gastos de esta tarjeta y del mes de pago del estado que no
                  están vinculados a ningún movimiento del PDF. Si reconoces uno
                  entre los nuevos con otro nombre, revísalo antes de guardar
                  para evitar duplicarlo. Desde sus acciones puedes editar el
                  gasto existente.
                </p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Persona</TableHead>
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
