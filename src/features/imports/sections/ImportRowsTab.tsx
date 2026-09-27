import type { ImportRowsTabProps } from "../types/import-types";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { ImportRowStatus } from "@/shared/api/types";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { ROW_STATUS } from "@/features/imports/constants/import-options";
import { useImportRowsTab } from "../hooks/useImportRowsTab";
import { IMPORT_STATUS_ALL } from "../constants/import-options";
import { ImportRowStatusBadge } from "../components/ImportRowStatusBadge";
import { amountOf, importRowFileName } from "../lib/import-view";

export function ImportRowsTab({ batchId, tab, applied }: ImportRowsTabProps) {
  const {
    page,
    setPage,
    q,
    setQ,
    status,
    setStatus,
    data,
    pages,
    issues,
    statuses,
  } = useImportRowsTab(batchId, tab);

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
          value={status ?? IMPORT_STATUS_ALL}
          onValueChange={(value) => {
            setStatus(
              value === IMPORT_STATUS_ALL
                ? undefined
                : (value as ImportRowStatus),
            );
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={IMPORT_STATUS_ALL}>Estado: todos</SelectItem>
            {statuses.map((value) => (
              <SelectItem key={value} value={value}>
                {ROW_STATUS[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data && data.items.length === 0 && (
        <p className="text-sm text-muted-foreground">Nada que mostrar.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>{issues ? "Mensaje" : "Descripción"}</TableHead>
                  {!issues && (
                    <TableHead className="text-right">Monto</TableHead>
                  )}
                  {!issues && (
                    <TableHead>
                      {applied ? "Guardado en" : "Se guardará en"}
                    </TableHead>
                  )}
                  <TableHead>Origen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <ImportRowStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="max-w-md">
                      {issues ? row.message : row.description}
                    </TableCell>
                    {!issues && (
                      <TableCell className="text-right tabular-nums">
                        {amountOf(row)}
                      </TableCell>
                    )}
                    {!issues && (
                      <TableCell className="text-sm">
                        {row.destination}
                      </TableCell>
                    )}
                    <TableCell
                      className="max-w-48 truncate text-xs text-muted-foreground"
                      title={`${row.file}:${row.line}`}
                    >
                      {importRowFileName(row.file)}:{row.line}
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
                  <span className="font-medium">
                    {issues ? row.message : row.description}
                  </span>
                  {!issues && (
                    <span className="tabular-nums">{amountOf(row)}</span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <ImportRowStatusBadge status={row.status} />
                  {row.destination && <span>→ {row.destination}</span>}
                  <span>
                    {importRowFileName(row.file)}:{row.line}
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
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="Anterior"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                aria-label="Siguiente"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
