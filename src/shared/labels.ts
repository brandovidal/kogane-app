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
  partially_paid: "Parcialmente pagado",
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
  not_started: "bg-slate-500/10 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300",
  pending: "bg-amber-500/12 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  partially_paid: "bg-orange-500/12 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300",
  partial: "bg-emerald-500/12 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  deposited: "bg-emerald-500/12 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  waived: "bg-slate-500/10 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300",
  paid: "bg-blue-500/12 text-blue-800 dark:bg-blue-400/15 dark:text-blue-300",
  amortized: "bg-violet-500/12 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300",
  prepaid: "bg-violet-500/12 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300",
  cashback: "bg-cyan-500/12 text-cyan-800 dark:bg-cyan-400/15 dark:text-cyan-300",
  skipped: "bg-slate-500/10 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300",
  late: "bg-red-500/12 text-red-800 dark:bg-red-400/15 dark:text-red-300",
};

export const PAYMENT_STATUS_DOT_COLORS: Record<string, string> = {
  not_started: "bg-slate-500",
  pending: "bg-amber-500",
  partially_paid: "bg-orange-500",
  partial: "bg-emerald-500",
  deposited: "bg-emerald-500",
  waived: "bg-slate-400",
  paid: "bg-blue-500",
  amortized: "bg-violet-500",
  prepaid: "bg-violet-500",
  cashback: "bg-cyan-500",
  skipped: "bg-slate-500",
  late: "bg-red-500",
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

export const RECURRING_TARGET_LABELS: Record<string, string> = {
  fixed_cost: "Costo fijo",
  subscription: "Recurrente o plataforma",
  credit_card: "Tarjeta",
};
export const RECURRING_TARGETS = Object.keys(RECURRING_TARGET_LABELS);

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

// Préstamos e inversiones (P27, D99–D100)
export const COMMITMENT_KIND_LABELS: Record<string, string> = {
  loan: "Préstamo",
  investment: "Inversión",
};

export const COMMITMENT_SUBTYPE_LABELS: Record<string, string> = {
  loan: "Préstamo",
  land: "Terreno",
  property: "Propiedad",
  vehicle: "Vehículo",
  stocks: "Acciones",
  crypto: "Cripto",
  other: "Otra",
};

export const COMMITMENT_STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  paid: "Pagado",
  cancelled: "Cancelado",
};

export const ATTACHMENT_KIND_LABELS: Record<string, string> = {
  boleta: "Boleta",
  recibo: "Recibo",
  contrato: "Contrato",
  otro: "Otro",
};
