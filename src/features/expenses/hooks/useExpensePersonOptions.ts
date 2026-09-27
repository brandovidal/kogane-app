import { useMemo } from "react";
import { usePeople } from "@/shared/api/hooks/catalogs";
import type { FilterSelectOption } from "@/shared/components/filters/FilterSelect";
import { PERSON_ME, PERSON_FILTER_LABELS } from "../constants/expense-filters";

export function useExpensePersonOptions(): FilterSelectOption[] {
  const { data: people } = usePeople();

  return useMemo(() => {
    const me = people?.find((person) => person.isDefault);
    return [
      {
        value: PERSON_ME,
        label: PERSON_FILTER_LABELS.ME,
        searchTerms: me ? [me.name, ...me.aliases] : [],
      },
      ...(people ?? [])
        .filter((person) => person.isActive && !person.isDefault)
        .map((person) => ({ value: person.id, label: person.name, searchTerms: person.aliases })),
    ];
  }, [people]);
}
