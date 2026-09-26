import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { nameById, usePeople } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/shared/api/hooks/expenses";
import { useStatements } from "@/shared/api/hooks/statements";
import {
  useAssignStatementPerson,
  useAssignStatementRows,
  useCreateStatementRows,
  useUpdateStatementRow,
} from "@/shared/api/hooks/statements";
import { PersonSelect } from "@/shared/components/CatalogSelect";
import { EXPENSE_RESOURCES, type CreditCardExpense, type Statement, type StatementRow } from "@/shared/api/types";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { confirmCreateText, countsOf, ROW_RESULT_LABELS, rowName, rowsOf, totalsMatch } from "../statement-view";
import { EditRowDialog } from "./EditRowDialog";
import { StatementRowActions } from "./StatementRowActions";
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
  !!row.debtId || (row.result !== "matched" && row.result !== "created" && !!row.personId && row.personId !== statementPersonId);

function RowsTable({
  statementId,
  statementPersonId,
  rows,
  onCreate,
}: {
  statementId: string;
  statementPersonId: string | null;
  rows: StatementRow[];
  onCreate: (row: StatementRow) => void;
}) {
  const update = useUpdateStatementRow();
  const assignRows = useAssignStatementRows();
  const [editingRow, setEditingRow] = useState<StatementRow | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignTo, setAssignTo] = useState<string | null>(null);
  const personName = nameById(usePeople().data);
  // Matched and created rows follow the person of their expense: only the others can be given to someone
  const selectable = rows.filter((row) => (row.result === "new" || row.result === "ignored") && !row.locked);
  const allChecked = selectable.length > 0 && selectable.every((row) => selected.has(row.id));
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
          <span className="px-1 font-medium">{selected.size} seleccionadas · Asignar a</span>
          <div className="w-48">
            <PersonSelect value={assignTo} onChange={setAssignTo} placeholder="Elige la persona" />
          </div>
          <Button size="sm" onClick={assign} disabled={!assignTo || assignRows.isPending}>
            Asignar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
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
                  checked={allChecked ? true : selected.size ? "indeterminate" : false}
                  onCheckedChange={(on) => setSelected(on === true ? new Set(selectable.map((row) => row.id)) : new Set())}
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
                    disabled={row.locked || row.result === "matched" || row.result === "created"}
                    checked={selected.has(row.id)}
                    onCheckedChange={(on) => toggle(row.id, on === true)}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {row.date ? formatDate(row.date) : "—"}
                </TableCell>
                <TableCell className="min-w-56">
                  <div>
                    <span>{rowName(row)}</span>
                    {row.installment && <Badge variant="outline" className="ml-2">{row.installment}</Badge>}
                    {row.label && <p className="text-xs text-muted-foreground">Banco: {row.description}</p>}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.amount, row.currency)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {row.personId ? personName(row.personId) : "—"}
                  {isCollect(row, statementPersonId) && (
                    <Badge variant="outline" className="ml-2 text-[10px]" title="Al guardarlo se crea su cobro">
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
                    onSave={() => onCreate(row)}
                    onIgnore={() =>
                      update.mutate({ id: statementId, rowId: row.id, result: "ignored" })
                    }
                    onRestore={() =>
                      update.mutate({ id: statementId, rowId: row.id, result: "new" })
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
            update.mutate({ id: statementId, rowId: editingRow.id, ...changes }, { onSuccess: () => setEditingRow(null) })
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
  const personName = nameById(usePeople().data);
  const statementHistory = useStatements().data ?? [];
  const previousPeriod = statement.paymentMonth === 1
    ? { month: 12, year: statement.paymentYear - 1 }
    : { month: statement.paymentMonth - 1, year: statement.paymentYear };
  const { data: currentCardExpenses = [] } = useExpenses(EXPENSE_RESOURCES.creditCard, {
    month: statement.paymentMonth,
    year: statement.paymentYear,
  });
  const { data: previousCardExpenses = [] } = useExpenses(EXPENSE_RESOURCES.creditCard, previousPeriod);
  const [editingExpenseId, setEditingExpenseId] = useState<string>();
  const editingExpense: CreditCardExpense | undefined = [...currentCardExpenses, ...previousCardExpenses]
    .find((expense) => expense.id === editingExpenseId);
  const openExpense = (expenseId: string) => setEditingExpenseId(expenseId);
  const counts = countsOf(statement);
  const newRows = rowsOf(statement, "new");
  const matchedRows = rowsOf(statement, "matched");
  const where = `${statement.cardName} · ${getMonthName(statement.paymentMonth)} ${statement.paymentYear}`;
  const history = statementHistory
    .filter((item) => item.paymentMethodId === statement.paymentMethodId &&
      (item.paymentYear < statement.paymentYear || (item.paymentYear === statement.paymentYear && item.paymentMonth < statement.paymentMonth)))
    .sort((a, b) => b.paymentYear - a.paymentYear || b.paymentMonth - a.paymentMonth)
    .slice(0, 4);

  const collectFrom = (row: StatementRow) =>
    row.personId && row.personId !== statement.personId ? personName(row.personId) : undefined;
  const askCreate = (row: StatementRow) =>
    setPending({ rowIds: [row.id], ...confirmCreateText(row, where, collectFrom(row)) });
  const newCollects = newRows.filter((row) => row.result === "new" && collectFrom(row)).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {where}
          <Badge variant="outline">{statement.source === "ai" ? "Leído con AI" : "Leído sin AI"}</Badge>
        </CardTitle>
        <div className="flex max-w-sm items-center gap-2 text-sm">
          <span className="shrink-0 text-muted-foreground">Persona</span>
          <PersonSelect
            value={statement.personId}
            onChange={(personId) => personId && assignPerson.mutate({ id: statement.id, personId })}
            placeholder="Sin asignar"
          />
        </div>
        <div className="grid gap-2 pt-2 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Total del banco</p>
            <p className="font-semibold tabular-nums">{statement.totalDue != null ? formatCurrency(statement.totalDue) : "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Registrado en Kogane</p>
            <p className="font-semibold tabular-nums">{formatCurrency(statement.koganeTotal)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Diferencia</p>
            <p className={`flex items-center gap-1 font-semibold tabular-nums ${totalsMatch(statement) ? "text-emerald-600" : "text-amber-600"}`}>
              {totalsMatch(statement) ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {statement.difference != null ? formatCurrency(statement.difference) : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Pagar hasta</p>
            <p className="font-semibold">{statement.dueDate ? formatDate(statement.dueDate) : "—"}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <StatementTotalCard
            paymentMethodId={statement.paymentMethodId}
            cardName={statement.cardName}
            month={statement.paymentMonth}
            year={statement.paymentYear}
            compact
          />
        </div>
        {(statement.previousBalance != null || statement.monthlyPayment != null) && (
          <div className="mb-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-sm font-medium">Saldo del mes anterior</p>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 text-sm">
                <span>{formatCurrency(statement.previousBalance ?? 0)}</span>
                <span className="text-muted-foreground">− pagos {formatCurrency(statement.previousPayments ?? 0)} =</span>
                <strong className="text-primary">{formatCurrency((statement.previousBalance ?? 0) - (statement.previousPayments ?? 0))}</strong>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">La tabla incluye solo el remanente neto para agregar.</p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-sm font-medium">Pago del mes</p>
              <p className="mt-2 text-lg font-semibold tabular-nums">{statement.monthlyPayment != null ? formatCurrency(statement.monthlyPayment) : "—"}</p>
              <p className="text-xs text-muted-foreground">Dato informativo tomado del estado de cuenta.</p>
            </div>
          </div>
        )}
        {history.length > 0 && (
          <div className="mb-4 rounded-lg border p-3">
            <p className="mb-2 text-sm font-medium">Cálculo de estados anteriores</p>
            <div className="space-y-1.5">
              {history.map((item) => (
                <div key={item.id} className="flex flex-wrap justify-between gap-x-4 text-xs text-muted-foreground">
                  {item.previousBalance == null && item.monthlyPayment == null ? (
                    <span>{getMonthName(item.paymentMonth)} {item.paymentYear}: desglose no disponible; vuelve a cargar ese estado</span>
                  ) : (
                    <>
                      <span>{getMonthName(item.paymentMonth)} {item.paymentYear}: {formatCurrency(item.previousBalance ?? 0)} − {formatCurrency(item.previousPayments ?? 0)} = {formatCurrency((item.previousBalance ?? 0) - (item.previousPayments ?? 0))}</span>
                      <span>Pago del mes {item.monthlyPayment != null ? formatCurrency(item.monthlyPayment) : "—"}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <Tabs defaultValue={counts.new || statement.rows.some((row) => row.locked) ? "new" : "matched"}>
          <TabsList>
            <TabsTrigger value="new">Nuevos ({counts.new})</TabsTrigger>
            <TabsTrigger value="matched">Coinciden ({counts.matched})</TabsTrigger>
            <TabsTrigger value="missing">Solo en Kogane ({counts.missing})</TabsTrigger>
          </TabsList>

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
              <p className="text-sm text-muted-foreground">Todo lo del estado de cuenta ya está registrado.</p>
            ) : (
              <RowsTable statementId={statement.id} statementPersonId={statement.personId} rows={newRows} onCreate={askCreate} />
            )}
          </TabsContent>

          <TabsContent value="matched" className="mt-3 space-y-2">
            {matchedRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nada coincidió todavía.</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Coinciden por monto y fecha cercana o cuota. Si uno se llama igual pero es de otro mes u otra tarjeta, guárdalo de todas
                  formas o ignóralo.
                </p>
                <RowsTable statementId={statement.id} statementPersonId={statement.personId} rows={matchedRows} onCreate={askCreate} />
              </>
            )}
          </TabsContent>

          <TabsContent value="missing" className="mt-3">
            {statement.missing.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todo lo registrado para esta tarjeta y mes está en el estado de cuenta.</p>
            ) : (
              <>
                <p className="mb-2 text-sm text-muted-foreground">
                  Registrados en Kogane pero no aparecen en el estado: pueden ser de otro mes o de otra tarjeta. Si uno es el mismo que un
                  nuevo con otro nombre, ignora el nuevo; para corregirlo ábrelo en Tarjetas.
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
                          <TableCell className="text-sm text-muted-foreground">{expense.processDate ? formatDate(expense.processDate) : "—"}</TableCell>
                          <TableCell>
                            {expense.description} {expense.installment && <Badge variant="outline">{expense.installment}</Badge>}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatCurrency(expense.amount)}</TableCell>
                          <TableCell className="text-sm">{personName(expense.personId)}</TableCell>
                          <TableCell className="text-right">
                            <MissingExpenseActions expenseName={expense.description} onEdit={() => openExpense(expense.id)} />
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

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.title}</AlertDialogTitle>
            <AlertDialogDescription>{pending?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) createRows.mutate({ id: statement.id, rowIds: pending.rowIds });
                setPending(null);
              }}
            >
              Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ExpenseEditDialog
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpenseId(undefined)}
        resource={EXPENSE_RESOURCES.creditCard}
        expense={editingExpense}
      />
    </Card>
  );
}
