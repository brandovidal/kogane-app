// Menu of the web (D41, D80): Inicio, then Registrar (Mensajes · Reconocimiento · Borrador; Nuevo gasto is the button
// of each page, D79) and the
// screens grouped. Labels of API values live in labels.ts (D62).
export type NavIcon =
  | "message-circle"
  | "scan-text"
  | "inbox"
  | "layout-dashboard"
  | "plus-circle"
  | "receipt"
  | "coffee"
  | "tv"
  | "credit-card"
  | "repeat"
  | "hand-coins"
  | "pie-chart"
  | "tags"
  | "bar-chart-3"
  | "settings"
  | "wallet"
  | "calendar"
  | "file-text"
  | "landmark";

export interface NavLink {
  href: string;
  label: string;
  icon: NavIcon;
  badge?: "drafts"; // counter of Borrador
  cards?: boolean; // one sub-item per credit card (from the catalog)
  action?: "new-expense"; // opens the Nuevo gasto dialog instead of a page (D79)
}

export interface NavGroup {
  label: string;
  icon: NavIcon;
  children: NavLink[];
}

export type NavEntry = NavLink | NavGroup;

export const isGroup = (entry: NavEntry): entry is NavGroup => "children" in entry;

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

export interface Card {
  href: string;
  label: string;
}

// Every link, with the cards under Tarjetas: for Ctrl+K and to know which group holds the current page
export interface FlatLink {
  href: string;
  label: string;
  group?: string;
  action?: NavLink["action"];
}

export function flattenNav(nav: NavEntry[], cards: Card[] = []): FlatLink[] {
  const links: FlatLink[] = [];
  for (const entry of nav) {
    if (!isGroup(entry)) {
      links.push({ href: entry.href, label: entry.label });
      continue;
    }
    for (const child of entry.children) {
      links.push({ href: child.href, label: child.label, group: entry.label, action: child.action });
      if (child.cards) cards.forEach((card) => links.push({ ...card, group: entry.label }));
    }
  }
  return [...links, NOTIFICATIONS_LINK, { href: SETTINGS_NAV.href, label: SETTINGS_NAV.label }];
}

// A static page is served with or without a trailing slash (/cobros, /cobros/): both are the same page (D102)
export const isActivePath = (href: string, currentPath: string) => {
  const path = currentPath.length > 1 ? currentPath.replace(/\/+$/, "") : currentPath;
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
};
