import { ArrowDown, ArrowUp, X } from "lucide-react";
import { AppliedFilterSection } from "./AppliedFilterSection";

export function AppliedSortChip({
  label,
  descending,
  onRemove,
}: {
  label: string;
  descending: boolean;
  onRemove: () => void;
}) {
  return (
    <AppliedFilterSection label="Orden">
      <span className="inline-flex h-6 items-center gap-1 rounded-full border border-brand/40 bg-brand/10 px-2 text-xs font-medium text-brand">
        {descending ? (
          <ArrowDown aria-hidden="true" className="size-3.5" />
        ) : (
          <ArrowUp aria-hidden="true" className="size-3.5" />
        )}
        {label}
        <button
          type="button"
          aria-label="Quitar orden"
          onClick={onRemove}
          className="inline-flex size-4 items-center justify-center rounded-full hover:bg-brand/20"
        >
          <X aria-hidden="true" className="size-3" />
        </button>
      </span>
    </AppliedFilterSection>
  );
}
