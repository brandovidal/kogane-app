import { describe, expect, it } from "vitest";

import { periodStore } from "@/shared/stores/period.store";

describe("period store", () => {
  it("should move between months across the year end", () => {
    periodStore.getState().setPeriod(12, 2026);
    periodStore.getState().navigate(1);
    expect(periodStore.getState()).toMatchObject({ month: 1, year: 2027 });

    periodStore.getState().navigate(-2);
    expect(periodStore.getState()).toMatchObject({ month: 11, year: 2026 });
  });
});
