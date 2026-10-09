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
  collect: "Cobros del mes y atrasados",
};

export const NOTIFICATION_KINDS = Object.keys(
  NOTIFICATION_KIND_LABELS,
) as NotificationKind[];

const LINK_BY_REF: Record<string, string> = {
  fixed_cost: "/costos-fijos",
  subscription: "/plataformas",
  card_statement: "/tarjetas",
  credit_card_expense: "/tarjetas",
  daily_expense: "/dia-a-dia",
  debt: "/cobros", // debt notices are what others owe (due, late)
  category: "/categorias",
  statement: "/importacion",
};

const LINK_BY_KIND: Partial<Record<NotificationKind, string>> = {
  due: "/calendario",
  card_close: "/calendario",
  recurring: "/recurrentes",
  budget: "/categorias",
  collect: "/cobros",
};

export function notificationLink(
  notification: Pick<AppNotification, "kind" | "refType">,
): string {
  return (
    (notification.refType && LINK_BY_REF[notification.refType]) ??
    LINK_BY_KIND[notification.kind] ??
    "/"
  );
}

// "hace 5 min", "hace 3 h", "ayer", "hace 4 días", then the date
export function timeAgo(iso: string, now: Date = new Date()): string {
  const minutes = Math.max(
    0,
    Math.round((now.getTime() - new Date(iso).getTime()) / 60_000),
  );
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  // dd/mm of the day in Lima (the ICU of Node and of each browser writes es-PE dates differently)
  const [, month, day] = new Date(iso)
    .toLocaleDateString("en-CA", { timeZone: "America/Lima" })
    .split("-");
  return `${day}/${month}`;
}

// Tabs of the bell (header board 12): everything, what is unread, and what asks for a payment or a collection
export const NOTIFICATION_TABS = [
  { value: "all", label: "Todas" },
  { value: "unread", label: "Sin leer" },
  { value: "due", label: "Vencimientos" },
] as const;
export type NotificationTab = (typeof NOTIFICATION_TABS)[number]["value"];

const DUE_KINDS: ReadonlySet<NotificationKind> = new Set([
  "due",
  "card_close",
  "collect",
]);

export function filterByTab<T extends Pick<AppNotification, "kind" | "readAt">>(
  items: T[],
  tab: NotificationTab,
): T[] {
  if (tab === "unread") return items.filter((item) => !item.readAt);
  if (tab === "due") return items.filter((item) => DUE_KINDS.has(item.kind));
  return items;
}

const limaDay = (date: Date) =>
  date.toLocaleDateString("en-CA", { timeZone: "America/Lima" });

export type DayGroup = "Hoy" | "Ayer" | "Antes";

// Day of a notice in Lima, as Hoy / Ayer / Antes
export function dayGroup(iso: string, now: Date = new Date()): DayGroup {
  const day = limaDay(new Date(iso));
  if (day === limaDay(now)) return "Hoy";
  if (day === limaDay(new Date(now.getTime() - 86_400_000))) return "Ayer";
  return "Antes";
}

// Keeps the order received; empty groups do not appear
export function groupByDay<T extends Pick<AppNotification, "createdAt">>(
  items: T[],
  now: Date = new Date(),
): Array<{ label: DayGroup; items: T[] }> {
  const groups: Array<{ label: DayGroup; items: T[] }> = [];
  for (const item of items) {
    const label = dayGroup(item.createdAt, now);
    const group = groups.find((entry) => entry.label === label);
    if (group) group.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

// "9:12" of today or yesterday, "dd/mm" for older notices
export function noticeTime(iso: string, now: Date = new Date()): string {
  if (dayGroup(iso, now) === "Antes") return timeAgo(iso, now);
  return new Date(iso).toLocaleTimeString("en-GB", {
    timeZone: "America/Lima",
    hour: "numeric",
    minute: "2-digit",
  });
}
