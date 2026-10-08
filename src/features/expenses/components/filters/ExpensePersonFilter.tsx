import { UserRound } from "lucide-react";
import { FilterSelect } from "@/shared/components/filters/FilterSelect";
import { cn } from "@/shared/utils/cn";
import { useMe } from "@/shared/api/hooks/catalogs";
import { PERSON_ALL, PERSON_FILTER_LABELS, PERSON_ME, PERSON_UNASSIGNED } from "../../constants/expense-filters";
import { useExpensePersonOptions } from "../../hooks/useExpensePersonOptions";

interface ExpensePersonFilterProps {
  value?: string;
  onChange: (person: string | undefined) => void;
  compact?: boolean;
  searchable?: boolean;
  width?: string;
  className?: string;
  counts?: Record<string, number>;
}

/** Shared person filter for the toolbar and the fixed-cost/platform filter sheets. */
export function ExpensePersonFilter({
  value,
  onChange,
  compact = false,
  searchable = false,
  width = "w-full",
  className,
  counts,
}: ExpensePersonFilterProps) {
  const me = useMe();
  const selectedValue = value
    ?.split(",")
    .map((person) => person === me ? PERSON_ME : person)
    .filter((person, index, people) => people.indexOf(person) === index)
    .join(",");
  const options = useExpensePersonOptions().map((option) => ({
    ...option,
    count: counts?.[option.value === "__me__" ? me ?? option.value : option.value],
  }));
  const optionsWithUnassigned = options.map((option) =>
    option.value === PERSON_UNASSIGNED
      ? { ...option, count: counts?.[PERSON_UNASSIGNED] }
      : option,
  );

  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border bg-muted/40 px-3",
          className,
        )}
      >
        <UserRound aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <span className="whitespace-nowrap text-sm font-medium">Persona</span>
        <FilterSelect
          label="Persona"
          value={selectedValue ?? PERSON_ALL}
          options={optionsWithUnassigned}
          onChange={onChange}
          allValue={PERSON_ALL}
          allLabel="Todas las personas"
          allTriggerLabel={PERSON_FILTER_LABELS.ALL}
          width="w-auto"
          searchable
          multiple
          compactSelectionSummary
          multipleFooter
          emptyDescription="Nadie coincide con la búsqueda. Las personas salen de los registros de esta vista."
          labelClassName="sr-only"
          containerClassName="space-y-0"
          triggerClassName="h-8 min-w-[4.5rem] gap-1 rounded-md border-0 bg-muted/70 px-2 shadow-none hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    );
  }

  return (
    <FilterSelect
      label="Persona"
      icon={UserRound}
      value={selectedValue ?? PERSON_ALL}
      options={optionsWithUnassigned}
      onChange={onChange}
      allValue={PERSON_ALL}
      allLabel="Todas las personas"
      width={width}
      searchable={searchable}
      multiple
      compactSelectionSummary
      multipleFooter
      allTriggerLabel={PERSON_FILTER_LABELS.ALL}
      emptyDescription="Nadie coincide con la búsqueda. Las personas salen de los registros de esta vista."
      labelClassName="text-sm font-medium"
    />
  );
}
