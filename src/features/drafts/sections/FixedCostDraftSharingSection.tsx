import { ShareEditor } from "../components/ShareEditor";
import type { DraftFormSectionProps } from "../types/draft-form";

export function FixedCostDraftSharingSection({
  value,
  onChange,
}: DraftFormSectionProps) {
  return (
    <ShareEditor
      value={value.sharedWith}
      total={value.amount}
      currency={value.currency ?? "PEN"}
      onChange={(sharedWith) => onChange({ ...value, sharedWith })}
    />
  );
}
