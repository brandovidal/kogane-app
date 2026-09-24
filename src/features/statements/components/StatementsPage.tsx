import { useState } from "react";
import { CheckCircle2, FileUp, RotateCcw, Trash2, XCircle } from "lucide-react";

import { useCreditCards } from "@/shared/api/hooks/catalogs";
import {
  useCreateStatementRows,
  useDeleteStatement,
  useSetStatementRow,
  useStatement,
  useStatements,
  useUploadStatement,
} from "@/shared/api/hooks/statements";
import { ApiError } from "@/shared/api/client";
import { withQuery } from "@/shared/api/query";
import type { Statement } from "@/shared/api/types";
import { CatalogSelectOptions } from "@/shared/components/CatalogSelect";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate, getMonthName } from "@/shared/lib/dates";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { countsOf, rowsOf, totalsMatch, uploadErrorText } from "../statement-view";

function UploadCard({ onRead }: { onRead: (id: string) => void }) {
  const upload = useUploadStatement();
  const cards = useCreditCards().data ?? [];
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [cardId, setCardId] = useState<string | null>(null);
  const error = upload.error instanceof ApiError ? upload.error : null;
  const reason = (error?.details as { reason?: string } | undefined)?.reason;
  const needsPassword = error?.code === "STATEMENT_PASSWORD";
  const needsCard = error?.code === "STATEMENT_UNREADABLE" && reason?.startsWith("card not found");

  const send = () =>
    file &&
    upload.mutate(
      { file, password: password || undefined, paymentMethodId: cardId ?? undefined },
      {
        onSuccess: (statement) => {
          setFile(null);
          setPassword("");
          setCardId(null);
          onRead(statement.id);
        },
      },
    );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Subir estado de cuenta</CardTitle>
        <p className="text-sm text-muted-foreground">
          El PDF que te manda el banco. Se abre con tu N.º de documento y se compara con los gastos de esa tarjeta.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        {needsPassword && (
          <Input
            type="password"
            placeholder="Contraseña del PDF"
            autoComplete="off"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
        {needsCard && (
          <CatalogSelectOptions
            value={cardId}
            onChange={setCardId}
            placeholder="¿De qué tarjeta es?"
            options={cards.map((card) => ({ id: card.id, name: card.name }))}
          />
        )}
        {error && <p className="text-sm text-destructive">{uploadErrorText(error.code, reason)}</p>}
        {!error && upload.isError && <p className="text-sm text-destructive">No se pudo subir el estado de cuenta.</p>}
        <Button onClick={send} disabled={!file || upload.isPending}>
          <FileUp className="mr-1 h-4 w-4" /> {upload.isPending ? "Leyendo…" : "Leer y conciliar"}
        </Button>
      </CardContent>
    </Card>
  );
}

function StatementDetail({ statement }: { statement: Statement }) {
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

// Estados de cuenta (P14 block 2, D95): upload the PDF of the bank, reconcile it and create what is missing
function StatementsPageView() {
  const statements = useStatements().data ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const current = selected ?? statements[0]?.id ?? null;
  const detail = useStatement(current).data;
  const remove = useDeleteStatement();

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="space-y-4">
        <UploadCard onRead={setSelected} />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leídos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {statements.length === 0 && <p className="text-sm text-muted-foreground">Todavía no subiste estados de cuenta.</p>}
            {statements.map((statement) => (
              <div
                key={statement.id}
                className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm ${statement.id === current ? "bg-muted" : ""}`}
              >
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setSelected(statement.id)}>
                  <span className="font-medium">{statement.cardName}</span> · {getMonthName(statement.paymentMonth)}{" "}
                  {statement.paymentYear}
                  <span className="block text-xs text-muted-foreground">
                    {statement.counts.matched + statement.counts.created} coinciden · {statement.counts.new} nuevos
                  </span>
                </button>
                {statement.status === "done" ? <Badge variant="secondary">Listo</Badge> : <Badge>Revisar</Badge>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Eliminar"
                  onClick={() => window.confirm("¿Eliminar este estado de cuenta? Los gastos que creó se quedan.") && remove.mutate(statement.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      {detail ? <StatementDetail statement={detail} /> : <EmptyState title="Sin estados de cuenta" description="Sube el PDF de tu tarjeta para conciliarlo." />}
    </div>
  );
}

export const StatementsPage = withQuery(StatementsPageView);
