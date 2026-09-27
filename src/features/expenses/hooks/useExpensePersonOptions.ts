import { useMemo } from "react";
import { usePeople } from "@/shared/api/hooks/catalogs";
import type { FilterSelectOption } from "@/shared/components/filters/FilterSelect";
import { PERSON_ME, PERSON_FILTER_LABELS } from "../constants/expense-filters";

export function useExpensePersonOptions(): FilterSelectOption[] {
  const { data: people } = usePeople();

  return useMemo(() => [
    { value: PERSON_ME, label: PERSON_FILTER_LABELS.ME },
    ...(people ?? [])
      .filter((person) => person.isActive && !person.isDefault)
      .map((person) => ({ value: person.id, label: person.name })),
  ], [people]);
}
