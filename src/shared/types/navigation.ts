// Menu of the web (D41, D80): Inicio, then Registrar (Mensajes · Importación · Borrador; Nuevo gasto is the button
// of each page, D79) and the
// screens grouped. API labels live in domain constants (D62).
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
  description?: string;
  icon: NavIcon;
  badge?: "drafts"; // counter of Borrador
  cards?: boolean; // one sub-item per credit card (from the catalog)
  action?: "new-expense"; // opens the Nuevo gasto dialog instead of a page (D79)
}

export interface NavGroup {
  label: string;
  description?: string;
  icon: NavIcon;
  children: NavLink[];
}

export type NavEntry = NavLink | NavGroup;

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
