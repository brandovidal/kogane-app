import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { useCreateStatementRows, useUpdateStatementRow } from "@/shared/api/hooks/statements";
import type { Statement, StatementRow } from "@/shared/api/types";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { confirmCreateText, countsOf, ROW_RESULT_LABELS, rowName, rowsOf, totalsMatch } from "../statement-view";
import { EditRowDialog } from "./EditRowDialog";
import { StatementRowActions } from "./StatementRowActions";
import { MissingExpenseActions } from "./MissingExpenseActions";

interface PendingCreate {
  rowIds?: string[];
  title: string;
  description: string;
}

function RowsTable({
  statementId,
  rows,
  onCreate,
}: {
  statementId: string;
  rows: StatementRow[];
  onCreate: (row: StatementRow) => void;
}) {
  const update = useUpdateStatementRow();
  const [editingRow, setEditingRow] = useState<StatementRow | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className={row.result === "ignored" ? "opacity-60" : ""}>
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
          onSave={(label) =>
            update.mutate({ id: statementId, rowId: editingRow.id, label }, { onSuccess: () => setEditingRow(null) })
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
  const counts = countsOf(statement);
  const newRows = rowsOf(statement, "new");
  const matchedRows = rowsOf(statement, "matched");
  const where = `${statement.cardName} · ${getMonthName(statement.paymentMonth)} ${statement.paymentYear}`;

  const askCreate = (row: StatementRow) => setPending({ rowIds: [row.id], ...confirmCreateText(row, where) });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {where}
          <Badge variant="outline">{statement.source === "ai" ? "Leído con AI" : "Leído sin AI"}</Badge>
        </CardTitle>
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
        <Tabs defaultValue={counts.new ? "new" : "matched"}>
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
                    description: `Se crean como gastos pendientes de ${where}, con el nombre que les diste (o el del banco). Los ignorados no se guardan.`,
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
              <RowsTable statementId={statement.id} rows={newRows} onCreate={askCreate} />
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
                <RowsTable statementId={statement.id} rows={matchedRows} onCreate={askCreate} />
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
                          <TableCell className="text-right">
                            <MissingExpenseActions expenseName={expense.description} />
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
    </Card>
  );
}
