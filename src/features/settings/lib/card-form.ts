// What a card needs to be saved from Configuración ▸ Cuentas y tarjetas (D97): the same rule kogane-api enforces
// (PAYMENT_METHOD_INCOMPLETE), so the form says what is missing before sending
export interface CardForm {
  name: string;
  type: "credit_card" | "debit_card";
  code: string;
  bank: string;
  billingCloseDay: string;
  paymentDueDay: string;
}

export const emptyCardForm = (): CardForm => ({
  name: "",
  type: "credit_card",
  code: "",
  bank: "",
  billingCloseDay: "",
  paymentDueDay: "",
});

const isDay = (value: string) => /^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 31;

// Field → message; empty when the card can be saved
export function cardErrors(form: CardForm): Partial<Record<keyof CardForm, string>> {
  const errors: Partial<Record<keyof CardForm, string>> = {};
  if (!form.name.trim()) errors.name = "Ponle un nombre";
  if (form.type === "credit_card") {
    if (!form.code.trim()) errors.code = "El código corto (CMR, IO…)";
    if (!isDay(form.billingCloseDay)) errors.billingCloseDay = "Día de cierre (1–31)";
    if (!isDay(form.paymentDueDay)) errors.paymentDueDay = "Día de pago (1–31)";
  } else if (!form.bank.trim()) {
    errors.bank = "El banco de la tarjeta";
  }
  return errors;
}

// The body of POST /v1/payment-methods: only what its type uses
export function cardBody(form: CardForm) {
  const base = { name: form.name.trim(), type: form.type, aliases: [form.name.trim().toLowerCase()] };
  return form.type === "credit_card"
    ? {
        ...base,
        code: form.code.trim().toUpperCase(),
        billingCloseDay: Number(form.billingCloseDay),
        paymentDueDay: Number(form.paymentDueDay),
      }
    : { ...base, bank: form.bank.trim() };
}
