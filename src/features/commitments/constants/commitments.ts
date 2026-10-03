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
