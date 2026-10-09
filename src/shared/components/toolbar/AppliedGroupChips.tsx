import { X } from "lucide-react";
import { AppliedFilterSection } from "./AppliedFilterSection";

export interface AppliedGroupChipsProps<T extends string = string> {
  value: readonly T[];
  options: readonly { value: string; label: string }[];
  onChange: (value: T[]) => void;
}

export function AppliedGroupChips<T extends string>({
  value,
  options,
  onChange,
}: AppliedGroupChipsProps<T>) {
  if (!value.length) return null;
  const labels = value
    .map((selected) => options.find((item) => item.value === selected)?.label)
    .filter((label): label is string => !!label)
    .map((label) =>
      label
        .replace(/^Por\s+/i, "")
        .replace(/^./, (letter) => letter.toLocaleUpperCase()),
    );
  if (!labels.length) return null;

  return (
    <AppliedFilterSection label="Agrupar">
      <span className="inline-flex h-6 max-w-64 items-center gap-1 rounded-full border border-brand/40 bg-brand/10 px-2 text-xs font-medium text-brand">
        <span className="truncate">{labels.join(" › ")}</span>
        <button
          type="button"
          aria-label="Quitar agrupación"
          onClick={() => onChange([])}
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-full hover:bg-brand/20"
        >
          <X aria-hidden="true" className="size-3" />
        </button>
      </span>
    </AppliedFilterSection>
  );
}
