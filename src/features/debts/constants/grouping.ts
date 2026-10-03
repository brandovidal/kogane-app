export const DEBT_GROUP_MODE = {
  NONE: "none",
  PERSON: "person",
  CARD: "card",
  PERSON_AND_CARD: "person,card",
} as const;
export const DEBT_GROUP_VALUES = Object.values(DEBT_GROUP_MODE);
