import { describe, expect, it } from "vitest";
import {
  draftState,
  missingLabels,
  readyDrafts,
  summarizeDrafts,
} from "@/features/drafts/lib/draft-view";

const ready = { amount: 12, missingFields: [] };
const incomplete = {
  amount: null,
  missingFields: ["description", "amount", "paymentMethodId"],
};

describe("draft view", () => {
  it("clasifica el estado de un borrador", () => {
    expect(draftState(ready)).toBe("ready");
    expect(draftState(incomplete)).toBe("incomplete");
  });

  it("nombra lo que falta", () => {
    expect(missingLabels(incomplete)).toEqual([
      "Descripción",
      "Monto",
      "Medio de pago",
    ]);
    expect(missingLabels({ missingFields: ["otro"] })).toEqual(["otro"]);
  });

  it("resume los indicadores", () => {
    expect(summarizeDrafts([ready, incomplete])).toEqual({
      total: 2,
      ready: 1,
      incomplete: 1,
      readyPercent: 50,
      totalAmount: 12,
      withoutAmount: 1,
    });
    expect(summarizeDrafts([]).readyPercent).toBe(0);
  });

  it("guarda solo los listos", () => {
    expect(readyDrafts([ready, incomplete])).toEqual([ready]);
  });
});
