import type { Statement, StatementRow } from "@/shared/api/types";

// Estados de cuenta (P14, D95): the three tabs of a statement and the line that sums it up

export type StatementTab = "new" | "matched" | "missing";

export function rowsOf(statement: Statement, tab: Exclude<StatementTab, "missing">): StatementRow[] {
  if (tab === "new") return statement.rows.filter((row) => row.result === "new" || row.result === "ignored");
  return statement.rows.filter((row) => row.result === "matched" || row.result === "created");
}

export function countsOf(statement: Statement) {
  return {
    new: statement.rows.filter((row) => row.result === "new").length,
    matched: statement.rows.filter((row) => row.result === "matched" || row.result === "created").length,
    missing: statement.missing.length,
  };
}

// "Cuadra" when the total of the bank and what Kogane has for that card and month are the same (to the cent)
export const totalsMatch = (statement: Pick<Statement, "difference">) =>
  statement.difference != null && Math.abs(statement.difference) < 0.01;

// The error of an upload, in the words of the form
export function uploadErrorText(code: string, reason?: string): string {
  if (code === "STATEMENT_PASSWORD") {
    return reason === "missing"
      ? "El PDF tiene contraseña: guarda tu N.º de documento en Configuración ▸ Personas o escríbela aquí."
      : "La contraseña no abrió el PDF. Escribe la correcta.";
  }
  if (code === "STATEMENT_UNREADABLE") {
    if (reason?.startsWith("card not found")) return "No sé de qué tarjeta es: elígela y vuelve a subirlo.";
    return "No pude leer movimientos en ese PDF.";
  }
  return "No se pudo subir el estado de cuenta.";
}
