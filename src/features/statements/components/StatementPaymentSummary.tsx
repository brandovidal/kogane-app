import type { Statement } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { CURRENCY_OPTIONS } from "@/shared/constants/currency";

// "Resumen de movimientos y pagos del mes" del banco (D95): saldo anterior − abonos + lo consumido (con y sin
// cuotas) + intereses/comisiones = pago total, y el pago mínimo aparte. directConsumption/installmentConsumption/
// itemizedCharges los calcula el backend a partir de las mismas filas que ya se ven en la tabla, no del PDF: nunca
// se desalinean con lo que se muestra abajo
export function StatementPaymentSummary({ statement }: { statement: Statement }) {
  const rows = statement.balances.filter(
    (balance) =>
      balance.previousBalance != null ||
      balance.previousPayments != null ||
      balance.directConsumption !== 0 ||
      balance.installmentConsumption !== 0 ||
      balance.itemizedCharges !== 0 ||
      balance.totalDue != null,
  );
  if (!rows.length) return null;

  return (
    <div className="grid gap-3 pt-2 xl:grid-cols-2">
      {rows.map((balance) => {
        const money = (amount: number | null) =>
          amount == null ? "—" : formatCurrency(amount, balance.currency);
        const lines: [string, number | null, "add" | "subtract" | undefined][] = [
          ["Saldo pendiente del mes anterior", balance.previousBalance, undefined],
          ["Abonos del mes actual", balance.previousPayments, "subtract"],
          ["Consumos directos (sin cuotas)", balance.directConsumption, "add"],
          ["Consumos en cuotas", balance.installmentConsumption, "add"],
          ["Intereses, seguro y comisiones", balance.itemizedCharges, "add"],
        ];
        return (
          <section
            key={balance.currency}
            className="min-w-0 rounded-lg border bg-muted/10 p-3 text-sm"
          >
            <h3 className="mb-3 font-medium">
              {CURRENCY_OPTIONS.find((item) => item.value === balance.currency)
                ?.label ?? balance.currency}
            </h3>
            <dl className="space-y-1.5">
              {lines.map(([label, amount, sign]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">
                    {sign === "subtract" ? "− " : sign === "add" ? "+ " : ""}
                    {label}
                  </dt>
                  <dd className="tabular-nums">{money(amount)}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t pt-1.5 font-semibold">
                <dt>= Pago total del mes</dt>
                <dd className="tabular-nums">{money(balance.totalDue)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-muted-foreground">
                <dt>Pago mínimo</dt>
                <dd className="tabular-nums">{money(balance.minimumDue)}</dd>
              </div>
            </dl>
          </section>
        );
      })}
    </div>
  );
}
