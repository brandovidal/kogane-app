import type { Attachment } from "@/shared/api/types";
import { cn } from "@/shared/utils/cn";
import { ATTACHMENT_KIND_LABELS } from "../constants/attachments";

// «Tipo de archivo · se aplica a los que subas ahora» (boards 14b/14c)
export function AttachmentKindChips({
  value,
  onChange,
  disabled = false,
}: {
  value: Attachment["kind"];
  onChange: (kind: Attachment["kind"]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div>
        <p className="text-sm font-medium">Tipo de archivo</p>
        <p className="text-xs text-muted-foreground">
          Se aplica a los que subas ahora
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label="Tipo de archivo"
        className="flex flex-wrap gap-1.5"
      >
        {Object.entries(ATTACHMENT_KIND_LABELS).map(([kind, label]) => (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={value === kind}
            disabled={disabled}
            onClick={() => onChange(kind as Attachment["kind"])}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50",
              value === kind
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
