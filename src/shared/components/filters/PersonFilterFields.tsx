import { useMemo } from "react";

import { usePeople } from "@/shared/api/hooks/catalogs";
import {
  PersonFilter,
  type PersonFilterOption,
} from "@/shared/components/filters/PersonFilter";
import {
  PERSON_ALL,
  PERSON_FILTER_LABELS,
  PERSON_ME,
  PERSON_UNASSIGNED,
} from "@/shared/constants/person-filter";

export interface PersonFilterFieldsProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  counts?: Record<string, number>;
  includeUnassigned?: boolean;
  label?: string;
  activeMarker?: boolean;
  width?: string;
  labelClassName?: string;
  className?: string;
  presentation?: "popover" | "inline" | "responsive-sheet";
  multiple?: boolean;
  emptySelectionLabel?: string;
  triggerClassName?: string;
  useMeAlias?: boolean;
}

export function PersonFilterFields({
  value,
  onChange,
  counts,
  includeUnassigned = true,
  label = "Persona",
  activeMarker = true,
  width = "w-full",
  labelClassName = "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground",
  className,
  presentation = "responsive-sheet",
  multiple = true,
  emptySelectionLabel,
  triggerClassName,
  useMeAlias = true,
}: PersonFilterFieldsProps) {
  const peopleData = usePeople().data;
  const people = useMemo(() => peopleData ?? [], [peopleData]);
  const me = people.find((person) => person.isDefault)?.id;
  const selectedValue = value
    ?.split(",")
    .map((person) => (useMeAlias && person === me ? PERSON_ME : person))
    .filter((person) => person !== PERSON_ALL)
    .filter(
      (person, index, peopleValue) => peopleValue.indexOf(person) === index,
    );
  const selectedKey = selectedValue?.join(",") ?? "";

  const options = useMemo<PersonFilterOption[]>(() => {
    const selected = new Set(selectedKey ? selectedKey.split(",") : []);
    const personOptions: PersonFilterOption[] = [];
    const defaultPerson = people.find((person) => person.isDefault);
    const meName = defaultPerson?.name ?? PERSON_FILTER_LABELS.ME;
    if (defaultPerson || useMeAlias) {
      personOptions.push({
        value: useMeAlias ? PERSON_ME : (defaultPerson?.id ?? PERSON_ME),
        name: meName,
        aliases: [PERSON_FILTER_LABELS.ME, ...(defaultPerson?.aliases ?? [])],
        count: counts?.[defaultPerson?.id ?? PERSON_ME],
      });
    }
    personOptions.push(
      ...people
        .filter(
          (person) =>
            !person.isDefault &&
            (person.isActive ||
              (counts?.[person.id] ?? 0) > 0 ||
              selected.has(person.id)),
        )
        .map((person) => ({
          value: person.id,
          name: person.name,
          aliases: person.aliases,
          count: counts?.[person.id],
        })),
    );
    const visiblePeople = personOptions;
    const unassignedCount = counts?.[PERSON_UNASSIGNED];
    if (includeUnassigned) {
      visiblePeople.push({
        value: PERSON_UNASSIGNED,
        name: "Sin asignar",
        aliases: ["sin persona", "sin asignar", "ninguna"],
        count: counts == null ? undefined : (unassignedCount ?? 0),
        unassigned: true,
      });
    }
    return visiblePeople;
  }, [counts, includeUnassigned, people, selectedKey, useMeAlias]);

  const selectedValues =
    value && value !== PERSON_ALL ? (selectedValue ?? []) : [];

  return (
    <PersonFilter
      value={selectedValues}
      onChange={(next) => onChange(next.join(",") || undefined)}
      options={options}
      includeUnassigned={includeUnassigned}
      label={label}
      activeMarker={activeMarker}
      width={width}
      labelClassName={labelClassName}
      className={className}
      presentation={presentation}
      multiple={multiple}
      emptySelectionLabel={emptySelectionLabel}
      triggerClassName={triggerClassName}
    />
  );
}
