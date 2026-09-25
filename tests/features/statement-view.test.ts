import { describe, expect, it } from "vitest";

import { confirmCreateText, countsOf, rowName, rowsOf, totalsMatch, uploadErrorText } from "@/features/statements/statement-view";
import type { Statement, StatementRow } from "@/shared/api/types";

const row = (id: string, result: string) => ({ id, result }) as Statement["rows"][number];
const statement = {
  rows: [row("a", "new"), row("b", "ignored"), row("c", "matched"), row("d", "created")],
  missing: [{ id: "e" }],
  difference: 0.004,
} as unknown as Statement;

describe("statement view (P14)", () => {
  it("should split the rows into the tabs and count them", () => {
    expect(rowsOf(statement, "new").map((item) => item.id)).toEqual(["a", "b"]);
    expect(rowsOf(statement, "matched").map((item) => item.id)).toEqual(["c", "d"]);
    expect(countsOf(statement)).toEqual({ new: 1, matched: 2, missing: 1 });
  });

  it("should say it adds up only to the cent", () => {
    expect(totalsMatch(statement)).toBe(true);
    expect(totalsMatch({ difference: 15.5 })).toBe(false);
    expect(totalsMatch({ difference: null })).toBe(false);
  });

  it("should explain each upload error in the words of the form", () => {
    expect(uploadErrorText("STATEMENT_PASSWORD", "missing")).toContain("Configuración ▸ Personas");
    expect(uploadErrorText("STATEMENT_PASSWORD", "incorrect")).toContain("contraseña no abrió");
    expect(uploadErrorText("STATEMENT_UNREADABLE", "card not found: choose it")).toContain("elígela");
    expect(uploadErrorText("STATEMENT_UNREADABLE", "no movements")).toContain("No pude leer");
  });
});

describe("statement rows: your name and saving anyway", () => {
  const row = (over: Partial<StatementRow>): StatementRow =>
    ({ id: "r", description: "IZI*OSTEO PERU T", label: null, amount: 139.64, currency: "PEN", result: "new", ...over }) as StatementRow;

  it("should show your description over the bank text, which stays", () => {
    expect(rowName(row({}))).toBe("IZI*OSTEO PERU T");
    expect(rowName(row({ label: "OsteoPeru" }))).toBe("OsteoPeru");
  });

  it("should warn before saving a row that already matched", () => {
    expect(confirmCreateText(row({ result: "matched", label: "OsteoPeru" }), "Oh Pay · Setiembre 2026")).toMatchObject({
      title: "¿Guardarlo de todas formas?",
      description: expect.stringContaining('pasa a "Solo en Kogane"'),
    });
    expect(confirmCreateText(row({}), "Oh Pay · Setiembre 2026").title).toBe("¿Guardar este gasto?");
  });
});
