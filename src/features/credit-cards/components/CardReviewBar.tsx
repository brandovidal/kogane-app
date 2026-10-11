import { CheckCheck, Undo2 } from "lucide-react";

import { useReviewCardCharges } from "../hooks/cardReview";
import { Button } from "@/ui/button";

// Appears with a selection: marks the charges as checked against the statement, or unmarks them
export function CardReviewBar({
  selectedIds,
  reviewedCount,
  onDone,
}: {
  selectedIds: string[];
  /** How many of the selected charges are already reviewed */
  reviewedCount: number;
  onDone: () => void;
}) {
  const review = useReviewCardCharges();
  if (!selectedIds.length) return null;
  const run = (reviewed: boolean) =>
    review.mutate({ ids: selectedIds, reviewed }, { onSuccess: onDone });

  return (
    <div
      role="region"
      aria-label="Revisión contra el estado de cuenta"
      className="flex flex-wrap items-center gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-sm"
    >
      <span className="text-muted-foreground">
        {selectedIds.length}{" "}
        {selectedIds.length === 1 ? "seleccionado" : "seleccionados"}
      </span>
      <Button
        size="sm"
        className="ml-auto"
        disabled={review.isPending}
        onClick={() => run(true)}
      >
        <CheckCheck className="mr-1 size-4" /> Marcar como revisados
      </Button>
      {reviewedCount > 0 && (
        <Button
          size="sm"
          variant="outline"
          disabled={review.isPending}
          onClick={() => run(false)}
        >
          <Undo2 className="mr-1 size-4" /> Quitar revisión
        </Button>
      )}
    </div>
  );
}
