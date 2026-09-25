import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, FileUp, Search, Trash2, XCircle } from "lucide-react";

import { ApiError } from "@/shared/api/client";
import { useApplyImport, useDiscardImport, useImport, useImportRows, useImports, useUploadNotion } from "@/shared/api/hooks/imports";
import { useDeleteStatement, useStatement, useStatements, useUploadStatement } from "@/shared/api/hooks/statements";
import { withQuery } from "@/shared/api/query";
import type { ImportDetail, ImportRow, ImportRowStatus, ImportTab } from "@/shared/api/types";
import { PaymentMethodSelect, PersonSelect } from "@/shared/components/CatalogSelect";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate, getMonthName } from "@/shared/lib/dates";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { StatementDetail } from "@/features/statements/components/StatementDetail";
import { uploadErrorText } from "@/features/statements/statement-view";

import {
  BATCH_STATUS,
  historyOf,
  monthMatches,
  pageCount,
  ROW_STATUS,
  SOURCE_LABELS,
  TAB_LABELS,
  TAB_ORDER,
  type HistoryItem,
  type ImportSource,
} from "../import-view";

const ALL = "all";

function UploadCard({ onRead }: { onRead: (key: string) => void }) {
  const [source, setSource] = useState<ImportSource>("notion");
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [cardId, setCardId] = useState<string | null>(null);
  const [personId, setPersonId] = useState<string | null>(null);
  const [savePassword, setSavePassword] = useState(true);
  const notion = useUploadNotion();
  const statement = useUploadStatement();
  const upload = source === "notion" ? notion : statement;
  const error = upload.error instanceof ApiError ? upload.error : null;
  const reason = (error?.details as { reason?: string } | undefined)?.reason;
  const needsPassword = source === "statement" && error?.code === "STATEMENT_PASSWORD";

  const reset = () => {
    setFiles([]);
    setPassword("");
    setPersonId(null);
    notion.reset();
    statement.reset();
  };

  const send = () => {
    if (!files.length) return;
    if (source === "notion") {
      notion.mutate(files, { onSuccess: (batch) => (reset(), onRead(`notion:${batch.id}`)) });
      return;
    }
    statement.mutate(
      {
        file: files[0],
        password: password || undefined,
        paymentMethodId: cardId ?? undefined,
        personId: personId ?? undefined,
        savePassword,
      },
      { onSuccess: (read) => (reset(), onRead(`statement:${read.id}`)) },
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Subir para revisar</CardTitle>
        <p className="text-sm text-muted-foreground">
          Nada se guarda en tus gastos hasta que lo apruebes. Las capturas siguen entrando por{" "}
          <a className="underline" href="/mensajes">
            Mensajes
          </a>
          .
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Qué es</label>
          <Select
            value={source}
            onValueChange={(value) => {
              setSource(value as ImportSource);
              reset();
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SOURCE_LABELS) as ImportSource[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SOURCE_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{source === "notion" ? "El ZIP que exporta Notion o sus CSV" : "El PDF del banco"}</label>
          <Input
            key={source}
            type="file"
            multiple={source === "notion"}
            accept={source === "notion" ? ".zip,.csv" : "application/pdf"}
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
          {source === "notion" && (
            <p className="text-xs text-muted-foreground">
              Exporta "Seguimiento financiero" en Markdown y CSV. Se leen solo los *_all.csv de las 9 bases.
            </p>
          )}
        </div>

        {source === "statement" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tarjeta (opcional)</label>
              <PaymentMethodSelect type="credit_card" allowEmpty value={cardId} onChange={setCardId} placeholder="La reconoce del PDF" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Persona (opcional)</label>
              <PersonSelect allowEmpty value={personId} onChange={setPersonId} placeholder="Detectar en el PDF" />
              <p className="text-xs text-muted-foreground">Si no la eliges, se busca el titular en el PDF; si no aparece, se usa tu persona predeterminada.</p>
            </div>
          </div>
        )}
        {source === "statement" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Contraseña del PDF {needsPassword ? "*" : "(opcional)"}</label>
            <Input
              type="password"
              placeholder="Se prueban los N.º de documento guardados"
              autoComplete="off"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={needsPassword}
            />
            {password && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch checked={savePassword} onCheckedChange={setSavePassword} />
                Guardarla como N.º de documento de la persona del estado de cuenta (si abre el PDF)
              </label>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{source === "statement" ? uploadErrorText(error.code, reason) : error.message}</p>
        )}
        {!error && upload.isError && <p className="text-sm text-destructive">No se pudo subir.</p>}
        <Button onClick={send} disabled={!files.length || upload.isPending}>
          <FileUp className="mr-1 h-4 w-4" /> {upload.isPending ? "Leyendo…" : "Previsualizar"}
        </Button>
      </CardContent>
    </Card>
  );
}

function HistoryCard({ items, current, onSelect }: { items: HistoryItem[]; current: string | null; onSelect: (key: string) => void }) {
  const discard = useDiscardImport();
  const removeStatement = useDeleteStatement();

  const remove = (item: HistoryItem) => {
    if (item.source === "notion") {
      if (window.confirm("¿Descartar esta previsualización? No se importa nada.")) discard.mutate(item.id);
    } else if (window.confirm("¿Eliminar este estado de cuenta? Los gastos que creó se quedan.")) {
      removeStatement.mutate(item.id);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Historial</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Todavía no subiste nada.</p>}
        {items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm ${item.key === current ? "bg-muted" : ""}`}
          >
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onSelect(item.key)}>
              <span className="font-medium">{item.title}</span>
              <span className="text-muted-foreground"> · {formatDate(item.createdAt)}</span>
              <span className="block truncate text-xs text-muted-foreground">{item.detail}</span>
            </button>
            <Badge variant={item.pending ? "default" : "secondary"}>{BATCH_STATUS[item.status] ?? item.status}</Badge>
            {(item.source === "statement" || item.pending) && (
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Eliminar" onClick={() => remove(item)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RowStatusBadge({ status }: { status: ImportRowStatus }) {
  const { label, variant } = ROW_STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

const amountOf = (row: ImportRow) =>
  row.amount == null ? "—" : row.kind === "group" ? `${row.amount} %` : formatCurrency(row.amount, row.currency ?? "PEN");

// One tab of the preview: search, status filter, a table (cards on the phone) and pages of 50
function RowsTab({ batchId, tab, applied }: { batchId: string; tab: ImportTab; applied: boolean }) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ImportRowStatus | undefined>();
  const query = useImportRows(batchId, { tab, status, q, page });
  const data = query.data;
  const pages = pageCount(data?.total ?? 0, data?.pageSize ?? 50);
  const issues = tab === "issues";
  const statuses: ImportRowStatus[] = issues ? ["blocked", "warning"] : ["new", "changed", "unchanged"];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar…"
            value={q}
            onChange={(event) => {
              setQ(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status ?? ALL}
          onValueChange={(value) => {
            setStatus(value === ALL ? undefined : (value as ImportRowStatus));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Estado: todos</SelectItem>
            {statuses.map((value) => (
              <SelectItem key={value} value={value}>
                {ROW_STATUS[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data && data.items.length === 0 && <p className="text-sm text-muted-foreground">Nada que mostrar.</p>}

      {data && data.items.length > 0 && (
        <>
          <div className="hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>{issues ? "Mensaje" : "Descripción"}</TableHead>
                  {!issues && <TableHead className="text-right">Monto</TableHead>}
                  {!issues && <TableHead>{applied ? "Guardado en" : "Se guardará en"}</TableHead>}
                  <TableHead>Origen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <RowStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="max-w-md">{issues ? row.message : row.description}</TableCell>
                    {!issues && <TableCell className="text-right tabular-nums">{amountOf(row)}</TableCell>}
                    {!issues && <TableCell className="text-sm">{row.destination}</TableCell>}
                    <TableCell className="max-w-48 truncate text-xs text-muted-foreground" title={`${row.file}:${row.line}`}>
                      {row.file.replace(/ [0-9a-f]{32}(_all)?\.csv$/i, "")}:{row.line}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2 md:hidden">
            {data.items.map((row) => (
              <div key={row.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium">{issues ? row.message : row.description}</span>
                  {!issues && <span className="tabular-nums">{amountOf(row)}</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <RowStatusBadge status={row.status} />
                  {row.destination && <span>→ {row.destination}</span>}
                  <span>
                    {row.file.replace(/ [0-9a-f]{32}(_all)?\.csv$/i, "")}:{row.line}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {data.total} filas · página {page} de {pages}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Anterior" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Siguiente" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryTab({ batch }: { batch: ImportDetail }) {
  const kpis = [
    { label: batch.status === "applied" ? "Creadas" : "Nuevas", value: batch.created },
    { label: "Cambiaron en Notion", value: batch.updated },
    { label: "Iguales (no se tocan)", value: batch.unchanged },
    { label: "Bloqueadas · avisos", value: `${batch.blocked} · ${batch.warnings}` },
  ];
  const months = batch.summary.months.filter((month) => month.notionSpent != null);
  const matching = months.filter(monthMatches).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-xl font-semibold tabular-nums">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-sm">
          <span className="font-medium">Por mes frente al Resumen de Notion:</span>{" "}
          <span className={matching === months.length ? "text-emerald-600" : "text-amber-600"}>
            {matching} de {months.length} cuadran
          </span>
          <span className="block text-xs text-muted-foreground">Notion suma las filas enlazadas a cada Resumen (costos fijos y tarjetas), no el mes de pago.</span>
        </p>
        <div className="max-h-96 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Sueldo</TableHead>
                <TableHead className="text-right">Enlazadas</TableHead>
                <TableHead className="text-right">Notion</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...months].reverse().map((month) => (
                <TableRow key={`${month.year}-${month.month}`}>
                  <TableCell>
                    {getMonthName(month.month)} {month.year}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{month.salary != null ? formatCurrency(month.salary) : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(month.linked)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(month.notionSpent ?? 0)}</TableCell>
                  <TableCell>
                    {monthMatches(month) ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-amber-600" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Archivos: {batch.summary.files.map((file) => `${file.base} (${file.rows})`).join(" · ")}
      </div>
    </div>
  );
}

function NotionDetail({ id }: { id: string }) {
  const batch = useImport(id).data;
  const apply = useApplyImport();
  const discard = useDiscardImport();
  if (!batch) return null;
  const preview = batch.status === "preview";

  const confirmApply = () => {
    const total = batch.created + batch.updated;
    if (window.confirm(`¿Importar ${total} filas (${batch.created} nuevas y ${batch.updated} que cambiaron)? Las ${batch.unchanged} iguales no se tocan.`)) {
      apply.mutate(batch.id);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            Notion · {formatDate(batch.createdAt)}
            <Badge variant={preview ? "default" : "secondary"}>{BATCH_STATUS[batch.status]}</Badge>
          </CardTitle>
          {preview && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.confirm("¿Descartar sin importar?") && discard.mutate(batch.id)} disabled={discard.isPending}>
                Descartar
              </Button>
              <Button size="sm" onClick={confirmApply} disabled={apply.isPending || batch.created + batch.updated === 0}>
                {apply.isPending ? "Importando…" : "Importar"}
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {preview
            ? "Revisa dónde se guardará cada fila. Solo al importar se escriben tus gastos."
            : `Importado el ${batch.appliedAt ? formatDate(batch.appliedAt) : "—"}.`}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <div className="overflow-x-auto">
            <TabsList>
              <TabsTrigger value="summary">Resumen</TabsTrigger>
              {TAB_ORDER.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {TAB_LABELS[tab]} ({batch.tabs[tab]})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value="summary" className="mt-3">
            <SummaryTab batch={batch} />
          </TabsContent>
          {TAB_ORDER.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-3">
              <RowsTab batchId={batch.id} tab={tab} applied={!preview} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function StatementPreview({ id }: { id: string }) {
  const statement = useStatement(id).data;
  return statement ? <StatementDetail statement={statement} /> : null;
}

// Reconocimiento / Importación (P14, D104): a Notion export or a bank statement is uploaded, previewed and only then saved
function ImportsPageView() {
  const batches = useImports().data ?? [];
  const statements = useStatements().data ?? [];
  const history = historyOf(batches, statements, getMonthName);
  const [selected, setSelected] = useState<string | null>(null);
  const current = selected && history.some((item) => item.key === selected) ? selected : (history[0]?.key ?? null);
  const [source, id] = (current ?? ":").split(":");

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)]">
      <div className="space-y-4">
        <UploadCard onRead={setSelected} />
        <HistoryCard items={history} current={current} onSelect={setSelected} />
      </div>
      <div className="min-w-0">
        {source === "notion" && <NotionDetail id={id} />}
        {source === "statement" && <StatementPreview id={id} />}
        {!current && (
          <EmptyState
            title="Nada para revisar"
            description="Sube el export de Notion o el PDF de tu tarjeta. Las capturas van por Mensajes."
          />
        )}
      </div>
    </div>
  );
}

export const ImportsPage = withQuery(ImportsPageView);
