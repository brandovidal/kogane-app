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
  late: "Retrasado",
  partial: "Abonado",
  prepaid: "Amortizado",
};

export const PAYMENT_STATUS_GROUPS = [
  { label: "Por iniciar", statuses: ["not_started"] },
  { label: "En curso", statuses: ["pending", "late", "partially_paid"] },
  {
    label: "Completados",
    statuses: [
      "deposited",
      "partial",
      "amortized",
      "prepaid",
      "waived",
      "paid",
      "cashback",
      "skipped",
    ],
  },
] as const;

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  not_started:
    "bg-slate-500/10 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300",
  pending:
    "bg-amber-500/12 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  partially_paid:
    "bg-orange-500/12 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300",
  partial:
    "bg-emerald-500/12 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  deposited:
    "bg-emerald-500/12 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  waived:
    "bg-slate-500/10 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300",
  paid: "bg-blue-500/12 text-blue-800 dark:bg-blue-400/15 dark:text-blue-300",
  amortized:
    "bg-violet-500/12 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300",
  prepaid:
    "bg-violet-500/12 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300",
  cashback:
    "bg-cyan-500/12 text-cyan-800 dark:bg-cyan-400/15 dark:text-cyan-300",
  skipped:
    "bg-slate-500/10 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300",
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
