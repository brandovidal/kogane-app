import { describe, expect, it } from "vitest";
import { archiveSummary } from "@/features/credit-cards/lib/card-archive";
import { tabFromSearch } from "@/features/credit-cards/lib/card-links";

describe("card archive", () => {
  it("explains what happens to movements", () => {
    expect(archiveSummary(0, 0)).toBe("No tiene movimientos.");
    expect(archiveSummary(3, 0)).toContain("3 movimientos");
    expect(archiveSummary(1, 2)).toContain("2 pagos pendientes");
  });
  it("opens the payment tab from the address", () => {
    expect(tabFromSearch("?tarjeta=cmr&vista=pago")).toBe("payment");
    expect(tabFromSearch("?tarjeta=cmr")).toBeNull();
  });
});
