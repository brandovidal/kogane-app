import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { useCreateStatementRows, useSetStatementRow } from "@/shared/api/hooks/statements";
import type { Statement } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate, getMonthName } from "@/shared/lib/dates";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { countsOf, rowsOf, totalsMatch } from "../statement-view";

// A statement read (P14, D95): what it already has, what is new (created only with "Crear") and what is only in Kogane
export function StatementDetail({ statement }: { statement: Statement }) {
  const createRows = useCreateStatementRows();
  const setRow = useSetStatementRow();
  const counts = countsOf(statement);
  const newRows = rowsOf(statement, "new");
  const matchedRows = rowsOf(statement, "matched");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {statement.cardName} · {getMonthName(statement.paymentMonth)} {statement.paymentYear}
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
              <Button size="sm" onClick={() => createRows.mutate({ id: statement.id })} disabled={createRows.isPending}>
                Crear todos ({counts.new})
              </Button>
            )}
            {newRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todo lo del estado de cuenta ya está registrado.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newRows.map((row) => (
                    <TableRow key={row.id} className={row.result === "ignored" ? "opacity-50" : ""}>
                      <TableCell className="text-sm text-muted-foreground">{row.date ? formatDate(row.date) : "—"}</TableCell>
                      <TableCell>
                        {row.description} {row.installment && <Badge variant="outline">{row.installment}</Badge>}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(row.amount, row.currency)}</TableCell>
                      <TableCell className="text-right">
                        {row.result === "ignored" ? (
                          <Button variant="ghost" size="sm" onClick={() => setRow.mutate({ id: statement.id, rowId: row.id, result: "new" })}>
                            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Volver
                          </Button>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" onClick={() => createRows.mutate({ id: statement.id, rowIds: [row.id] })}>
                              Crear
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setRow.mutate({ id: statement.id, rowId: row.id, result: "ignored" })}>
                              Ignorar
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="matched" className="mt-3">
            {matchedRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nada coincidió todavía.</p>
            ) : (
              <Table>
                <TableBody>
                  {matchedRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-sm text-muted-foreground">{row.date ? formatDate(row.date) : "—"}</TableCell>
                      <TableCell>
                        {row.description} {row.installment && <Badge variant="outline">{row.installment}</Badge>}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(row.amount, row.currency)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {row.result === "created" ? "creado del estado" : "ya registrado"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="missing" className="mt-3">
            {statement.missing.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todo lo registrado para esta tarjeta y mes está en el estado de cuenta.</p>
            ) : (
              <>
                <p className="mb-2 text-sm text-muted-foreground">
                  Registrados en Kogane pero no aparecen en el estado: pueden ser de otro mes o de otra tarjeta. Revísalos en{" "}
                  <a className="underline" href="/tarjetas">Tarjetas</a>.
                </p>
                <Table>
                  <TableBody>
                    {statement.missing.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-sm text-muted-foreground">{expense.processDate ? formatDate(expense.processDate) : "—"}</TableCell>
                        <TableCell>
                          {expense.description} {expense.installment && <Badge variant="outline">{expense.installment}</Badge>}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(expense.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
