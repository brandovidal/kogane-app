import { X } from "lucide-react";
import { Button } from "@/ui/button";
import { cn } from "@/shared/utils/cn";
import { formatFileSize } from "@/features/messages/lib/chat-view";
import { fileBadge } from "../lib/upload-flow";

// Archivo elegido (boards I3 listo · I5 formato no compatible)
export function ImportFileCard({
  files,
  error,
  disabled = false,
  onRemove,
}: {
  files: Pick<File, "name" | "size">[];
  error?: string | null;
  disabled?: boolean;
  onRemove: () => void;
}) {
  const [first] = files;
  const total = files.reduce((sum, file) => sum + file.size, 0);
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-3",
        error && "border-destructive/60",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
          error
            ? "bg-destructive/15 text-destructive"
            : "bg-primary/15 text-primary",
        )}
      >
        {fileBadge(first.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {files.length > 1 ? `${files.length} archivos` : first.name}
        </p>
        <p
          role={error ? "alert" : undefined}
          className={cn(
            "text-xs",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {error ?? `${formatFileSize(total)} · listo para leer`}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label="Quitar archivo"
        disabled={disabled}
        onClick={onRemove}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
