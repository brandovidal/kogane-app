import { MultiSelect } from "@/shared/components/filters/MultiSelect";
import { NameAvatar } from "@/shared/components/data-display/NameAvatar";
import { PERSON_FILTER_LABELS } from "@/shared/constants/person-filter";

export interface PersonFilterOption {
  value: string;
  name: string;
  initials?: string;
  count?: number;
  aliases?: readonly string[];
  unassigned?: boolean;
}

export interface PersonFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: PersonFilterOption[];
  includeUnassigned?: boolean;
  label?: string;
  activeMarker?: boolean;
  width?: string;
  labelClassName?: string;
  className?: string;
  presentation?: "popover" | "inline" | "responsive-sheet";
}

export function PersonFilter({
  value,
  onChange,
  options,
  includeUnassigned = true,
  label = "Persona",
  activeMarker = true,
  width = "w-full",
  labelClassName = "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground",
  className,
  presentation = "responsive-sheet",
}: PersonFilterProps) {
  const multiSelectOptions = options
    .filter((option) => includeUnassigned || !option.unassigned)
    .map((option, index) => ({
      value: option.value,
      label: option.name,
      decoration: (
        <NameAvatar
          name={option.name}
          initials={option.initials}
          unassigned={option.unassigned}
        />
      ),
      searchTerms: option.aliases,
      count: option.count,
      separatorBefore: option.unassigned && index > 0,
    }));

  return (
    <div className={className}>
      <MultiSelect
        label={label}
        value={value}
        options={multiSelectOptions}
        onChange={(next) => onChange(next ?? [])}
        width={width}
        allLabel={PERSON_FILTER_LABELS.ALL}
        emptySelectionLabel={PERSON_FILTER_LABELS.ALL}
        emptyDescription={(query) => (
          <>
            Nadie coincide con «{query}».<br />
            Las personas salen de los registros de esta vista.
          </>
        )}
        emptyValueMeansAll
        highlightMatches
        summaryMode="person"
        presentation={presentation}
        activeMarker={activeMarker}
        labelClassName={labelClassName}
      />
    </div>
  );
}
