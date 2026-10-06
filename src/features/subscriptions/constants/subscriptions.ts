export const SUBSCRIPTION_STATUSES = [
  "not_started",
  "pending",
  "paid",
  "waived",
];

export const SUBSCRIPTION_PERIOD_LABELS: Record<string, string> = {
  biweekly: "Quincenal",
  monthly: "Mensual",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
};
export const SUBSCRIPTION_PERIODS = Object.keys(SUBSCRIPTION_PERIOD_LABELS);

export const SUBSCRIPTION_KIND_LABELS: Record<string, string> = {
  platform: "Plataforma",
  service: "Servicio",
  annual: "Anual",
  other: "Otro",
};
