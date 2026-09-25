import type { AppNotification, NotificationKind } from "@/shared/api/types";

// Notifications of the web (P20, D86): labels of each kind and where each notice takes you
export const NOTIFICATION_KIND_LABELS: Record<NotificationKind, string> = {
  due: "Vencimientos (un día antes)",
  card_close: "Cierre de tarjetas",
  daily_close: "Cierre del día (21:00)",
  weekly: "Resumen del domingo",
  budget: "Presupuesto al 80 %",
  anomaly: "Cargos raros",
  recurring: "Gastos recurrentes del mes",
  statement: "Estados de cuenta conciliados",
};

export const NOTIFICATION_KINDS = Object.keys(NOTIFICATION_KIND_LABELS) as NotificationKind[];

const LINK_BY_REF: Record<string, string> = {
  fixed_cost: "/costos-fijos",
  subscription: "/plataformas",
  card_statement: "/tarjetas",
  credit_card_expense: "/tarjetas",
  daily_expense: "/dia-a-dia",
  debt: "/cobros", // debt notices are what others owe (due, late)
  category: "/categorias",
  statement: "/reconocimiento",
};

const LINK_BY_KIND: Partial<Record<NotificationKind, string>> = {
  due: "/calendario",
  card_close: "/calendario",
  recurring: "/recurrentes",
  budget: "/categorias",
};

export function notificationLink(notification: Pick<AppNotification, "kind" | "refType">): string {
  return (notification.refType && LINK_BY_REF[notification.refType]) ?? LINK_BY_KIND[notification.kind] ?? "/";
}

// "hace 5 min", "hace 3 h", "ayer", "hace 4 días", then the date
export function timeAgo(iso: string, now: Date = new Date()): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  // dd/mm of the day in Lima (the ICU of Node and of each browser writes es-PE dates differently)
  const [, month, day] = new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Lima" }).split("-");
  return `${day}/${month}`;
}
