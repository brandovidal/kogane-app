import type { ReactNode } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/ui/button";
import { cn } from "@/shared/utils/cn";
import { formatCurrency } from "@/shared/lib/currency";
import { draftState, missingLabels } from "@/features/drafts/lib/draft-view";

interface DraftCardDraft {
  id: string;
  description: string | null;
  rawText: string | null;
  amount: number | null;
  currency: string | null;
  missingFields: string[];
}

// Tarjeta de Borrador (board B1): estado, monto, lo que falta y las acciones
export function DraftCard({
  draft,
  rows,
  discarded = false,
  busy = false,
  onSave,
  onEdit,
  onDiscard,
}: {
  draft: DraftCardDraft;
  /** Líneas "Etiqueta: valor" (destino, persona, reparto, origen). */
  rows: { label: string; value: ReactNode }[];
  discarded?: boolean;
  busy?: boolean;
  onSave: () => void;
  onEdit: () => void;
  onDiscard: () => void;
}) {
  const incomplete = draftState(draft) === "incomplete";
  const missing = missingLabels(draft);

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-3 rounded-2xl border bg-card p-4",
        incomplete && "border-amber-500/30",
      )}
    >
      <header className="space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate font-semibold">
            {draft.description ?? draft.rawText ?? "Sin descripción"}
          </h3>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
              incomplete
                ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            )}
          >
            <i className="size-1.5 rounded-full bg-current" />
            {incomplete ? "Falta info" : "Listo"}
          </span>
        </div>
        <p className="line-clamp-2 text-xs italic text-muted-foreground">
          {draft.rawText ? `«${draft.rawText}»` : "«sin texto · captura»"}
        </p>
      </header>

      <p
        className={cn(
          "text-2xl font-bold tabular-nums",
          draft.amount == null && "text-muted-foreground",
        )}
      >
        {draft.amount != null
          ? formatCurrency(draft.amount, draft.currency ?? "PEN")
          : "Sin monto"}
      </p>

      {incomplete && (
        <div className="space-y-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs">
          <p className="text-foreground">Para guardar completa:</p>
          <ul className="flex flex-wrap gap-1.5">
            {missing.map((label) => (
              <li
                key={label}
                className="rounded-full border border-amber-500/40 px-2 py-0.5 text-amber-700 dark:text-amber-300"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <dl className="space-y-1.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right">{row.value}</dd>
          </div>
        ))}
      </dl>

      <footer className="mt-auto flex items-center gap-2 pt-1">
        {incomplete ? (
          <Button
            variant="outline"
            className="flex-1 border-amber-500/50 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            onClick={onEdit}
          >
            <Pencil className="size-4" /> Completar
          </Button>
        ) : (
          <Button className="flex-1" onClick={onSave} disabled={busy}>
            <Check className="size-4" /> Guardar
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          aria-label="Editar"
          onClick={onEdit}
        >
          <Pencil className="size-4" />
        </Button>
        {!discarded && (
          <Button
            variant="outline"
            size="icon"
            aria-label="Descartar"
            className="text-destructive hover:text-destructive"
            onClick={onDiscard}
          >
            <X className="size-4" />
          </Button>
        )}
      </footer>
    </article>
  );
}
