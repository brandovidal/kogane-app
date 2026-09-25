import type { Statement, StatementRow } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";

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

export const ROW_RESULT_LABELS: Record<StatementRow["result"], string> = {
  new: "Nuevo",
  matched: "Ya registrado",
  created: "Creado del estado",
  ignored: "Ignorado",
};

// Your description when you gave one, else the text of the bank
export const rowName = (row: Pick<StatementRow, "label" | "description">) => row.label || row.description;

// What the confirmation says before saving one row: a matched one warns that it may already be registered
export function confirmCreateText(row: StatementRow, where: string): { title: string; description: string } {
  const what = `${rowName(row)} · ${formatCurrency(row.amount, row.currency)}`;
  if (row.result === "matched") {
    return {
      title: "¿Guardarlo de todas formas?",
      description: `${what} ya coincide con un gasto registrado (mismo monto y fecha cercana). Si es de otro mes u otra tarjeta, se crea uno nuevo en ${where} y el registrado pasa a "Solo en Kogane".`,
    };
  }
  return {
    title: "¿Guardar este gasto?",
    description: `${what} se crea como gasto pendiente de ${where}.`,
  };
}
