import { cn } from "@/shared/utils/cn";
import { ATTACHMENT_KIND_LABELS } from "../constants/attachments";

// «Todos 4 · Boleta 2 · Recibo 1…» sobre la lista de adjuntos (board 14b); solo los tipos que existen
export function AttachmentFilterChips({
  counts,
  value,
  onChange,
}: {
  counts: Record<string, number>;
  value: string;
  onChange: (kind: string) => void;
}) {
  const kinds = ["all", ...Object.keys(ATTACHMENT_KIND_LABELS)].filter(
    (kind) => kind === "all" || counts[kind],
  );
  return (
    <div
      role="group"
      aria-label="Filtrar por tipo"
      className="flex flex-wrap gap-1.5"
    >
      {kinds.map((kind) => (
        <button
          key={kind}
          type="button"
          aria-pressed={value === kind}
          onClick={() => onChange(kind)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            value === kind
              ? "border-primary bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {kind === "all" ? "Todos" : ATTACHMENT_KIND_LABELS[kind]}
          <span className="tabular-nums opacity-70">{counts[kind] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
