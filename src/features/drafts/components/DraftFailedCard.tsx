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

export const failureReason = (draft: Pick<FailedDraft, "missingFields">) => {
  const missing = missingLabels(draft);
  return missing.length
    ? `No se pudo leer: ${missing.join(", ").toLowerCase()}`
    : "No se pudo procesar";
};

// Tarjeta de Fallidos (board B5): qué falló, por qué y cómo seguir
export function DraftFailedCard({
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
  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="truncate font-semibold">
            {draft.description ?? KIND_TITLE[kind]}
          </h3>
          <p className="text-xs text-muted-foreground">
            {draft.channel === "web" ? "Mensajes" : "Telegram"} ·{" "}
            {formatDate(draft.createdAt)}
          </p>
        </div>
        <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
          Falló
        </span>
      </div>
      <p className="text-xs text-destructive">{failureReason(draft)}</p>
      {draft.rawText && (
        <p className="line-clamp-2 text-xs italic text-muted-foreground">
          «{draft.rawText}»
        </p>
      )}
      <div className="mt-auto flex items-center gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onRetry} disabled={busy}>
          <RotateCw className="size-4" /> Reintentar
        </Button>
        <Button variant="outline" size="sm" onClick={onWriteManually}>
          Escribir manual
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="ml-auto size-8 text-destructive hover:text-destructive"
          aria-label="Descartar"
          onClick={onDiscard}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </article>
  );
}
