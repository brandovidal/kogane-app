import { ImageIcon, Mic, RotateCw, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/ui/button";
import { formatDate } from "@/shared/lib/dates";
import { missingLabels } from "@/features/drafts/lib/draft-view";

interface FailedDraft {
  inputType: string;
  description: string | null;
  rawText: string | null;
  channel: string;
  createdAt: string;
  missingFields: string[];
}

const KIND_ICON = { image: ImageIcon, audio: Mic } as const;
const KIND_TITLE = {
  image: "Captura",
  audio: "Nota de voz",
  text: "Mensaje",
} as const;

// Fila de Fallidos (board B5): qué falló, por qué y cómo seguir
export function DraftFailedRow({
  draft,
  busy = false,
  onRetry,
  onWriteManually,
  onDiscard,
}: {
  draft: FailedDraft;
  busy?: boolean;
  onRetry: () => void;
  onWriteManually: () => void;
  onDiscard: () => void;
}) {
  const kind =
    draft.inputType === "image" || draft.inputType === "audio"
      ? draft.inputType
      : "text";
  const Icon = kind === "text" ? MessageSquare : KIND_ICON[kind];
  const missing = missingLabels(draft);

  return (
    <article className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card px-4 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <h3 className="truncate font-semibold">
          {draft.description ?? KIND_TITLE[kind]} ·{" "}
          {formatDate(draft.createdAt)}
        </h3>
        <p className="text-xs text-destructive">
          {missing.length
            ? `No se pudo leer: ${missing.join(", ").toLowerCase()}`
            : "No se pudo procesar"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {draft.rawText ? `«${draft.rawText}» · ` : ""}
          {draft.channel === "web" ? "Mensajes" : "Telegram"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onRetry} disabled={busy}>
          <RotateCw className="size-4" /> Reintentar
        </Button>
        <Button variant="outline" size="sm" onClick={onWriteManually}>
          Escribir manual
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8 text-destructive hover:text-destructive"
          aria-label="Descartar"
          onClick={onDiscard}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </article>
  );
}
