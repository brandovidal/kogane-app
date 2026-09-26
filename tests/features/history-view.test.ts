import { describe, expect, it } from "vitest";

import { describeChanges, formatValue } from "@/features/history/history-view";

describe("history-view", () => {
  it("should say an edit as before → after with the Spanish name of the field", () => {
    const lines = describeChanges("update", [
      { field: "amount", before: 1000, after: 1042 },
      { field: "paymentStatus", before: "pending", after: "paid" },
    ]);

    expect(lines).toEqual([
      { field: "amount", label: "Monto", before: expect.stringContaining("1,000.00"), after: expect.stringContaining("1,042.00") },
      { field: "paymentStatus", label: "Estado", before: "Pendiente", after: "Pagado" },
    ]);
  });

  it("should name the person or the card an id points to", () => {
    expect(formatValue("personId", "p1", { p1: "Brando" })).toBe("Brando");
    expect(formatValue("paymentMethodId", null, {})).toBe("—");
  });

  it("should read dates, money in the currency of the row and booleans", () => {
    expect(formatValue("dueDate", "2026-10-05T00:00:00.000+00:00")).toBe("05/10/2026");
    expect(formatValue("amount", 12.5, {}, "USD")).toContain("12.50");
    expect(formatValue("isActive", 1)).toBe("Sí");
    expect(formatValue("isActive", 0)).toBe("No");
  });

  it("should list only the fields a created row filled, without ids and timestamps", () => {
    const lines = describeChanges("create", [
      { field: "id", before: null, after: "abc" },
      { field: "description", before: null, after: "Terreno" },
      { field: "notes", before: null, after: null },
      { field: "createdAt", before: null, after: "2026-09-26T00:00:00.000+00:00" },
    ]);

    expect(lines.map((line) => line.field)).toEqual(["description"]);
  });

  it("should keep the value a delete had", () => {
    const lines = describeChanges("delete", [{ field: "description", before: "Zapatillas", after: null }]);

    expect(lines[0]).toEqual({ field: "description", label: "Descripción", before: "Zapatillas", after: "—" });
  });

  it("should show the document number as it came: never in the clear", () => {
    const [line] = describeChanges("update", [{ field: "documentNumber", before: "•••", after: "•••" }]);

    expect(line.after).toBe("•••");
  });
});
