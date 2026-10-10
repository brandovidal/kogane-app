import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Upload } from "lucide-react";

import { useListImport } from "../hooks/useListImport";
import type { ListImportTarget } from "../services/import.service";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { formatCurrency } from "@/shared/lib/currency";
import { Button } from "@/ui/button";

// "Importar lista…": pick the CSV of "Exportar lista (CSV)", review what is ready and what has issues, then create
export function ImportListDialog({
  open,
  onOpenChange,
  target,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: ListImportTarget;
  title: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const { mutate, reset, data, isPending } = useListImport(target);

  useEffect(() => {
    if (open) return;
    setFile(null);
    reset();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- clean up when it closes

  const preview = data && !data.applied ? data : null;
  const problems = preview?.rows.filter((row) => row.status === "issue") ?? [];

  const pick = (next: File | null) => {
    setFile(next);
    if (next) mutate({ file: next, apply: false });
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Sube el CSV con las columnas de «Exportar lista (CSV)»: antes de crear nada ves qué filas están listas."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!file || !preview?.ready || isPending}
            onClick={() =>
              file &&
              mutate(
                { file, apply: true },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            {preview?.ready
              ? `Importar ${preview.ready} ${preview.ready === 1 ? "fila" : "filas"}`
              : "Importar"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <input
          ref={input}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => pick(event.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={() => input.current?.click()}
        >
          <Upload className="mr-2 size-4" />
          {file ? file.name : "Elegir archivo CSV"}
        </Button>

        {preview && (
          <div className="space-y-2 text-sm" aria-live="polite">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="size-4" /> {preview.ready} listas
              </span>
              {preview.withIssues > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <AlertTriangle className="size-4" /> {preview.withIssues} con
                  problemas
                </span>
              )}
              <span className="text-muted-foreground">de {preview.total}</span>
            </p>
            {problems.length > 0 && (
              <ul className="max-h-52 space-y-1.5 overflow-y-auto rounded-md border p-2">
                {problems.map((row) => (
                  <li key={row.line} className="text-xs">
                    <span className="font-medium">
                      Línea {row.line}
                      {row.description ? ` · ${row.description}` : ""}
                      {row.amount != null
                        ? ` · ${formatCurrency(row.amount)}`
                        : ""}
                    </span>
                    <span className="block text-muted-foreground">
                      {row.issues.join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {preview.withIssues > 0 && preview.ready > 0 && (
              <p className="text-xs text-muted-foreground">
                Las filas con problemas no se crean: corrígelas en el archivo y
                vuelve a subirlo.
              </p>
            )}
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
}
