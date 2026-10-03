import type { DraftFields } from "../hooks/drafts";

export interface DraftFormSectionProps {
  value: DraftFields;
  onChange: (value: DraftFields) => void;
  missingFields: string[];
}
