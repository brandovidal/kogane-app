import { useCallback, type SetStateAction } from "react";
import { useUrlGrouping } from "@/shared/hooks/useUrlGrouping";
import { DEBT_GROUP_MODE, DEBT_GROUP_VALUES } from "../constants/grouping";

export function useDebtGrouping() {
  const [group, setGroup] = useUrlGrouping(
    DEBT_GROUP_VALUES,
    DEBT_GROUP_MODE.NONE,
  );
  const groupedByPerson =
    group === DEBT_GROUP_MODE.PERSON ||
    group === DEBT_GROUP_MODE.PERSON_AND_CARD;
  const groupedByCard =
    group === DEBT_GROUP_MODE.CARD || group === DEBT_GROUP_MODE.PERSON_AND_CARD;
  const setFlag = useCallback(
    (key: "person" | "card", value: SetStateAction<boolean>) => {
      setGroup((current) => {
        const person =
          current === DEBT_GROUP_MODE.PERSON ||
          current === DEBT_GROUP_MODE.PERSON_AND_CARD;
        const card =
          current === DEBT_GROUP_MODE.CARD ||
          current === DEBT_GROUP_MODE.PERSON_AND_CARD;
        const previous = key === "person" ? person : card;
        const checked = typeof value === "function" ? value(previous) : value;
        const nextPerson = key === "person" ? checked : person;
        const nextCard = key === "card" ? checked : card;
        return nextPerson && nextCard
          ? DEBT_GROUP_MODE.PERSON_AND_CARD
          : nextPerson
            ? DEBT_GROUP_MODE.PERSON
            : nextCard
              ? DEBT_GROUP_MODE.CARD
              : DEBT_GROUP_MODE.NONE;
      });
    },
    [setGroup],
  );

  return {
    groupedByPerson,
    groupedByCard,
    setGroupedByPerson: (value: SetStateAction<boolean>) =>
      setFlag("person", value),
    setGroupedByCard: (value: SetStateAction<boolean>) =>
      setFlag("card", value),
  };
}
