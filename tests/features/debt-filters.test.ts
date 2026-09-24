import { describe, expect, it } from "vitest";

import { applyDebtFilters, buildCollectMessage, groupByPerson, isSharedDebt } from "@/features/debts/debt-filters";
import type { Debt } from "@/shared/api/types";

const debt = (overrides: Record<string, unknown>) =>
  ({
  description: "Iphone 16",
  personId: "danery",
  person: { name: "Danery" },
  status: "pending",
  timing: "due",
  paymentMonth: 9,
  paymentYear: 2026,
  notes: null,
  installment: null,
  balance: 100,
  ...overrides,
  }) as unknown as Debt;

const debts = [
  debt({ description: "Netflix (compartido)", balance: 32 }),
  debt({ description: "Iphone 16", installment: "3/12", status: "partial", timing: "late", paymentMonth: 8, balance: 300 }),
  debt({ description: "Préstamo", personId: "brenda", person: { name: "Brenda" }, timing: "upcoming", paymentMonth: 10, balance: 50 }),
];
const september = { month: 9, year: 2026 };

describe("debt filters (D80)", () => {
  it("should filter by person, state, month and origin", () => {
    const names = (filters: Parameters<typeof applyDebtFilters>[1]) =>
      applyDebtFilters(debts, filters, september).map((item) => item.description);

    expect(names({ person: "brenda" })).toEqual(["Préstamo"]);
    expect(names({ state: "late" })).toEqual(["Iphone 16"]);
    expect(names({ state: "partial" })).toEqual(["Iphone 16"]);
    expect(names({ month: "only" })).toEqual(["Netflix (compartido)"]);
    expect(names({ month: "until" })).toEqual(["Netflix (compartido)", "Iphone 16"]);
    expect(names({ origin: "shared" })).toEqual(["Netflix (compartido)"]);
    expect(names({ q: "prestamo" })).toEqual(["Préstamo"]);
    expect(isSharedDebt({ description: "Netflix (compartido)" })).toBe(true);
  });

  it("should group by person with the biggest balance first", () => {
    expect(groupByPerson(debts).map((group) => [group.name, group.total, group.debts.length])).toEqual([
      ["Danery", 332, 2],
      ["Brenda", 50, 1],
    ]);
  });

  it("should write the /cobrar message as plain text", () => {
    expect(buildCollectMessage("Danery", debts.slice(0, 2))).toBe(
      [
        "Hola Danery 👋, te paso el detalle de lo pendiente:",
        "• Netflix (compartido), set 2026: S/ 32.00",
        "• Iphone 16 (cuota 3/12), ago 2026: S/ 300.00",
        "",
        "Total: S/ 332.00",
        "¡Gracias! 🙌",
      ].join("\n"),
    );
  });
});
