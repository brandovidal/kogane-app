import { describe, expect, it } from "vitest";

import { PERSON_ALL, PERSON_ME, personStore, resolvePersonId } from "@/shared/stores/person.store";

describe("person filter (D71)", () => {
  it("should start on Yo and change to everyone or one person", () => {
    expect(personStore.getState().person).toBe(PERSON_ME);
    personStore.getState().setPerson("person-danery");
    expect(personStore.getState().person).toBe("person-danery");
    personStore.getState().setPerson(PERSON_ME);
  });

  it("should resolve the personId of /v1/expenses", () => {
    expect(resolvePersonId(PERSON_ME, "person-brando")).toBe("person-brando");
    expect(resolvePersonId(PERSON_ALL, "person-brando")).toBeUndefined();
    expect(resolvePersonId("person-danery", "person-brando")).toBe("person-danery");
  });
});
