// Menu of the web (D41, D80): Inicio, then Registrar (Nuevo gasto · Mensajes · Reconocimiento · Borrador) and the
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
  | "wallet";

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
      { href: "#nuevo-gasto", label: "Nuevo gasto", icon: "plus-circle", action: "new-expense" },
      { href: "/mensajes", label: "Mensajes", icon: "message-circle" },
      { href: "/reconocimiento", label: "Reconocimiento", icon: "scan-text" },
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
  { href: "/deudas", label: "Préstamos y deudas", icon: "hand-coins" },
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
  return [...links, { href: SETTINGS_NAV.href, label: SETTINGS_NAV.label }];
}

export const isActivePath = (href: string, currentPath: string) =>
  href === "/" ? currentPath === "/" : currentPath === href || currentPath.startsWith(`${href}/`);
