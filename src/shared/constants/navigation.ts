import type { NavEntry, NavLink } from "@/shared/types/navigation";

export const NAV: NavEntry[] = [
  { href: "/", label: "Inicio", icon: "layout-dashboard" },
  {
    label: "Registrar",
    icon: "plus-circle",
    children: [
      { href: "/mensajes", label: "Mensajes", icon: "message-circle" },
      { href: "/reconocimiento", label: "Reconocimiento / Importación", icon: "scan-text" },
      { href: "/borrador", label: "Borrador", icon: "inbox", badge: "drafts" },
    ],
  },
  {
    label: "Gastos",
    icon: "receipt",
    children: [
      { href: "/dia-a-dia", label: "Día a día", icon: "coffee" },
      { href: "/costos-fijos", label: "Costos fijos", icon: "receipt" },
      { href: "/plataformas", label: "Plataformas", icon: "tv" },
      { href: "/tarjetas", label: "Tarjetas", icon: "credit-card", cards: true },
      { href: "/recurrentes", label: "Recurrentes", icon: "repeat" },
    ],
  },
  {
    // Cobros (me deben) · Deudas (debo) · Resumen (D114)
    label: "Cobros y deudas",
    icon: "hand-coins",
    children: [
      { href: "/cobros", label: "Cobros", icon: "hand-coins" },
      { href: "/deudas", label: "Deudas", icon: "wallet" },
      { href: "/resumen-deudas", label: "Resumen", icon: "file-text" },
    ],
  },
  { href: "/compromisos", label: "Préstamos e inversiones", icon: "landmark" }, // installments are fixed costs (P27)
  { href: "/calendario", label: "Calendario", icon: "calendar" },
  {
    label: "Presupuesto",
    icon: "pie-chart",
    children: [
      { href: "/relacion-gastos", label: "Grupos", icon: "pie-chart" },
      { href: "/categorias", label: "Categorías", icon: "tags" },
      { href: "/ingresos", label: "Ingresos", icon: "wallet" },
    ],
  },
  { label: "Reportes", icon: "bar-chart-3", children: [{ href: "/resumen", label: "Resumen mensual", icon: "bar-chart-3" }] },
];

// Groups open the first time (nothing remembered yet in this browser)
export const DEFAULT_OPEN_GROUPS = ["Registrar"];

export const SETTINGS_NAV: NavLink = { href: "/configuracion", label: "Configuración", icon: "settings" };

// Reached from the bell of the header (P20), not from the menu; Ctrl+K still finds it
export const NOTIFICATIONS_LINK = { href: "/notificaciones", label: "Notificaciones" };
