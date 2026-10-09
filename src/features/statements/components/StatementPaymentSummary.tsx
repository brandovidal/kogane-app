import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import type { Statement } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { CURRENCY_OPTIONS } from "@/shared/constants/currency";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import {
  useUpdateStatementBalances,
  type UpdateStatementBalanceInput,
} from "../hooks/statements";

type Currency = "PEN" | "USD";
type EditableField = Exclude<keyof UpdateStatementBalanceInput, "currency">;
type Draft = Record<Currency, Record<EditableField, string>>;

const fields: { key: EditableField; label: string }[] = [
  { key: "totalDue", label: "Total del banco" },
  { key: "minimumDue", label: "Pago mínimo" },
  { key: "previousBalance", label: "Saldo pendiente del mes anterior" },
  { key: "previousPayments", label: "Abonos del mes actual" },
  { key: "monthlyPayment", label: "Pago del mes" },
];

const currencies: Currency[] = ["PEN", "USD"];

function amountDraft(value: number | null | undefined) {
  return value == null ? "" : String(value);
}

function createDraft(statement: Statement): Draft {
  return Object.fromEntries(
    currencies.map((currency) => {
      const balance = statement.balances.find(
        (item) => item.currency === currency,
      );
      return [
        currency,
        {
          totalDue: amountDraft(balance?.totalDue),
          minimumDue: amountDraft(balance?.minimumDue),
          previousBalance: amountDraft(balance?.previousBalance),
          previousPayments: amountDraft(balance?.previousPayments),
          monthlyPayment: amountDraft(balance?.monthlyPayment),
        },
      ];
    }),
  ) as Draft;
}

function parseAmount(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// The itemized consumption rows are derived from the statement movements. Only bank-provided
// summary figures are editable, and both currencies are saved in one operation.
export function StatementPaymentSummary({
  statement,
}: {
  statement: Statement;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => createDraft(statement));
  const updateBalances = useUpdateStatementBalances();
  const rows = currencies.map(
    (currency) =>
      statement.balances.find((balance) => balance.currency === currency) ?? {
        currency,
        totalDue: null,
        minimumDue: null,
        previousBalance: null,
        previousPayments: null,
        monthlyPayment: null,
        koganeTotal: 0,
        difference: null,
        directConsumption: 0,
        installmentConsumption: 0,
        itemizedCharges: 0,
      },
  );

  const beginEditing = () => {
    setDraft(createDraft(statement));
    setEditing(true);
  };
  const cancelEditing = () => {
    setDraft(createDraft(statement));
    setEditing(false);
  };
  const save = () => {
    updateBalances.mutate(
      {
        id: statement.id,
        balances: currencies.map((currency) => ({
          currency,
          totalDue: parseAmount(draft[currency].totalDue),
          minimumDue: parseAmount(draft[currency].minimumDue),
          previousBalance: parseAmount(draft[currency].previousBalance),
          previousPayments: parseAmount(draft[currency].previousPayments),
          monthlyPayment: parseAmount(draft[currency].monthlyPayment),
        })),
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  return (
    <section className="space-y-3 pt-2">
      <div className="flex justify-end gap-2">
        {editing ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cancelEditing}
              disabled={updateBalances.isPending}
            >
              <X /> Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={save}
              disabled={updateBalances.isPending}
            >
              <Check />{" "}
              {updateBalances.isPending ? "Guardando…" : "Guardar ambos"}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={beginEditing}
          >
            <Pencil /> Editar
          </Button>
        )}
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {rows.map((balance) => {
          const money = (amount: number | null) =>
            amount == null ? "—" : formatCurrency(amount, balance.currency);
          const name =
            CURRENCY_OPTIONS.find((item) => item.value === balance.currency)
              ?.label ?? balance.currency;
          const lines: [
            string,
            number | null,
            "add" | "subtract" | undefined,
          ][] = [
            [
              "Saldo pendiente del mes anterior",
              balance.previousBalance,
              undefined,
            ],
            ["Abonos del mes actual", balance.previousPayments, "subtract"],
            [
              "Consumos directos (sin cuotas)",
              balance.directConsumption,
              "add",
            ],
            ["Consumos en cuotas", balance.installmentConsumption, "add"],
            ["Intereses, seguro y comisiones", balance.itemizedCharges, "add"],
          ];

          return (
            <section
              key={balance.currency}
              className="min-w-0 rounded-lg border bg-muted/10 p-3 text-sm"
            >
              <h3 className="mb-3 font-medium">{name}</h3>
              {editing ? (
                <div className="grid gap-x-3 gap-y-2 sm:grid-cols-2">
                  {fields.map(({ key, label }) => (
                    <label key={key} className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        {label}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        value={draft[balance.currency][key]}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            [balance.currency]: {
                              ...current[balance.currency],
                              [key]: event.target.value,
                            },
                          }))
                        }
                        aria-label={`${label} (${balance.currency})`}
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <dl className="space-y-1.5">
                  {lines.map(([label, amount, sign]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3"
                    >
                      <dt className="text-muted-foreground">
                        {sign === "subtract"
                          ? "− "
                          : sign === "add"
                            ? "+ "
                            : ""}
                        {label}
                      </dt>
                      <dd className="tabular-nums">{money(amount)}</dd>
                    </div>
                  ))}
                  {balance.monthlyPayment != null && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Pago del mes</dt>
                      <dd className="tabular-nums">
                        {money(balance.monthlyPayment)}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 border-t pt-1.5 font-semibold">
                    <dt>= Pago total del mes</dt>
                    <dd className="tabular-nums">{money(balance.totalDue)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-muted-foreground">
                    <dt>Pago mínimo</dt>
                    <dd className="tabular-nums">
                      {money(balance.minimumDue)}
                    </dd>
                  </div>
                </dl>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
