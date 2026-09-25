// Spanish labels for the values of kogane-api (D62): the data keeps the API values, only the screen translates them

export const CURRENCIES = ["PEN", "USD"] as const;

export const EXPENSE_TYPE_LABELS: Record<string, string> = {
  essential: "Necesario",
  guilty_pleasure: "Con culpa",
};
export const EXPENSE_TYPES = Object.keys(EXPENSE_TYPE_LABELS);

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  not_started: "No iniciado",
  pending: "Pendiente",
  partially_paid: "Parcial",
  deposited: "Abonado",
  waived: "Exonerado",
  paid: "Pagado",
  amortized: "Amortizado",
  cashback: "Cashback",
  skipped: "Omitido",
  // debts (P17)
  partial: "Abonado",
  prepaid: "Amortizado",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  partially_paid: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  partial: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  deposited: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  waived: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  amortized: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  prepaid: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  cashback: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  skipped: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

// Allowed statuses per table, the same lists as kogane-api (expense.constant.ts)
export const FIXED_COST_STATUSES = ["not_started", "pending", "partially_paid", "deposited", "waived", "paid"];
export const SUBSCRIPTION_STATUSES = ["not_started", "pending", "paid", "waived"];
export const CREDIT_CARD_STATUSES = [
  "not_started",
  "pending",
  "partially_paid",
  "deposited",
  "amortized",
  "cashback",
  "paid",
  "skipped",
];

export const SUBSCRIPTION_PERIOD_LABELS: Record<string, string> = {
  biweekly: "Quincenal",
  monthly: "Mensual",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
};
export const SUBSCRIPTION_PERIODS = Object.keys(SUBSCRIPTION_PERIOD_LABELS);

// exp_subscriptions.kind (D107): Plataformas shows platform, Recurrentes the other three
export const SUBSCRIPTION_KIND_LABELS: Record<string, string> = {
  platform: "Plataforma",
  service: "Servicio",
  annual: "Anual",
  other: "Otro",
};
export const RECURRING_KINDS = ["service", "annual", "other"] as const;

export const RECURRING_TARGET_LABELS: Record<string, string> = {
  fixed_cost: "Costo fijo",
  subscription: "Recurrente o plataforma",
  credit_card: "Tarjeta",
};
export const RECURRING_TARGETS = Object.keys(RECURRING_TARGET_LABELS);

export const PAYMENT_METHOD_TYPE_LABELS: Record<string, string> = {
  credit_card: "Tarjeta de crédito",
  debit_card: "Tarjeta de débito",
  wallet: "Billetera (Yape, Plin)",
  cash: "Efectivo",
  bank_transfer: "Transferencia",
};
export const PAYMENT_METHOD_TYPES = Object.keys(PAYMENT_METHOD_TYPE_LABELS);

export const DESTINATION_LABELS: Record<string, string> = {
  daily: "Día a día",
  fixed_cost: "Costo fijo",
  subscription: "Plataforma",
  credit_card: "Tarjeta",
  receivable: "Me deben",
  payable: "Le debo",
  discard: "No es gasto",
};

export const DEBT_DIRECTION_LABELS: Record<string, string> = {
  owed_to_me: "Me deben",
  i_owe: "Debo",
};

export const DEBT_TIMING_LABELS: Record<string, string> = {
  upcoming: "No iniciado",
  due: "Este mes",
  late: "Retrasado",
};
