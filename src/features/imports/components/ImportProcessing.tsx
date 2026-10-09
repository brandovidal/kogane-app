import { Check, Loader2 } from "lucide-react";
import { Button } from "@/ui/button";
import { cn } from "@/shared/utils/cn";
import { formatFileSize } from "@/features/messages/lib/chat-view";
import { currentStep, fileBadge, PROCESSING_STEPS } from "../lib/upload-flow";

// Leyendo el archivo (board I6): avance estimado y pasos
export function ImportProcessing({
  file,
  progress,
  onCancel,
}: {
  file: Pick<File, "name" | "size">;
  progress: number;
  onCancel: () => void;
}) {
  const step = currentStep(progress);
  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
          {fileBadge(file.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <b>Procesando…</b>
          <span className="tabular-nums text-muted-foreground">
            {progress}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <ol className="space-y-1.5 text-sm">
        {PROCESSING_STEPS.map((label, index) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2",
              index > step && "text-muted-foreground",
            )}
          >
            {index < step ? (
              <Check className="size-4 text-emerald-600" />
            ) : index === step ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <span className="size-4 rounded-full border" />
            )}
            {label}
          </li>
        ))}
      </ol>
      <Button variant="outline" size="sm" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
}
