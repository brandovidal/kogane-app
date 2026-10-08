import { createElement, useMemo } from "react";
import { usePeople } from "@/shared/api/hooks/catalogs";
import type { FilterSelectOption } from "@/shared/components/filters/FilterSelect";
import { PERSON_ME, PERSON_FILTER_LABELS, PERSON_UNASSIGNED } from "../constants/expense-filters";

function personAvatar(name: string) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase();
  return createElement("span", {
    "aria-hidden": true,
    className: "inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground",
  }, initials);
}

export function useExpensePersonOptions(): FilterSelectOption[] {
  const { data: people } = usePeople();

  return useMemo(() => {
    const me = people?.find((person) => person.isDefault);
    return [
      {
        value: PERSON_ME,
        label: me?.name ?? PERSON_FILTER_LABELS.ME,
        decoration: personAvatar(me?.name ?? PERSON_FILTER_LABELS.ME),
        searchTerms: me ? [PERSON_FILTER_LABELS.ME, ...me.aliases] : [],
      },
      ...(people ?? [])
        .filter((person) => person.isActive && !person.isDefault)
        .map((person) => ({ value: person.id, label: person.name, decoration: personAvatar(person.name), searchTerms: person.aliases })),
      {
        value: PERSON_UNASSIGNED,
        label: "Sin asignar",
        decoration: personAvatar("?"),
        searchTerms: ["sin persona", "sin asignar", "ninguna"],
      },
    ];
  }, [people]);
}
