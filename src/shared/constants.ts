// Menu of the web (D41, D49): Mensajes · Reconocimiento · Borrador first, then the screens grouped. Labels of API
// values live in labels.ts (D62).
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
  | "settings";

export interface NavLink {
  href: string;
  label: string;
  icon: NavIcon;
  badge?: "drafts"; // counter of Borrador
  cards?: boolean; // one sub-item per credit card (from the catalog)
}

export interface NavGroup {
  label: string;
  icon: NavIcon;
  children: NavLink[];
}

export type NavEntry = NavLink | NavGroup;

export const isGroup = (entry: NavEntry): entry is NavGroup => "children" in entry;

export const NAV: NavEntry[] = [
  { href: "/mensajes", label: "Mensajes", icon: "message-circle" },
  { href: "/reconocimiento", label: "Reconocimiento", icon: "scan-text" },
  { href: "/borrador", label: "Borrador", icon: "inbox", badge: "drafts" },
  { href: "/", label: "Inicio", icon: "layout-dashboard" },
  { href: "/nuevo", label: "Nuevo gasto", icon: "plus-circle" },
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
    ],
  },
  { label: "Reportes", icon: "bar-chart-3", children: [{ href: "/resumen", label: "Resumen mensual", icon: "bar-chart-3" }] },
];

export const SETTINGS_NAV: NavLink = { href: "/configuracion", label: "Configuración", icon: "settings" };

export interface Card {
  href: string;
  label: string;
}

// Every link, with the cards under Tarjetas: for Ctrl+K and to know which group holds the current page
export function flattenNav(nav: NavEntry[], cards: Card[] = []): { href: string; label: string; group?: string }[] {
  const links: { href: string; label: string; group?: string }[] = [];
  for (const entry of nav) {
    if (!isGroup(entry)) {
      links.push({ href: entry.href, label: entry.label });
      continue;
    }
    for (const child of entry.children) {
      links.push({ href: child.href, label: child.label, group: entry.label });
      if (child.cards) cards.forEach((card) => links.push({ ...card, group: entry.label }));
    }
  }
  return [...links, { href: SETTINGS_NAV.href, label: SETTINGS_NAV.label }];
}

export const isActivePath = (href: string, currentPath: string) =>
  href === "/" ? currentPath === "/" : currentPath === href || currentPath.startsWith(`${href}/`);
