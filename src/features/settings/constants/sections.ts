import {
  BellRing,
  History,
  Settings,
  UserRound,
  UsersRound,
  WalletCards,
  Contact,
  type LucideIcon,
} from "lucide-react";

export type SettingsSection =
  | "perfil"
  | "general"
  | "notificaciones"
  | "cuentas-tarjetas"
  | "personas"
  | "usuarios"
  | "historial";

export interface SettingsNavItem {
  key: SettingsSection;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const SETTINGS_NAV_GROUPS: {
  label: string;
  items: SettingsNavItem[];
}[] = [
  {
    label: "Cuenta",
    items: [
      { key: "perfil", label: "Perfil", icon: UserRound },
      { key: "general", label: "General", icon: Settings },
      { key: "notificaciones", label: "Notificaciones", icon: BellRing },
    ],
  },
  {
    label: "Catálogos",
    items: [
      {
        key: "cuentas-tarjetas",
        label: "Cuentas y tarjetas",
        icon: WalletCards,
      },
      { key: "personas", label: "Personas", icon: Contact },
    ],
  },
  {
    label: "Administración",
    items: [
      { key: "usuarios", label: "Usuarios", icon: UsersRound, adminOnly: true },
      { key: "historial", label: "Historial de cambios", icon: History },
    ],
  },
];

export type CardsAccountsTab = "credito" | "debito" | "cuentas-salida";

export const CARDS_ACCOUNTS_TABS: {
  key: CardsAccountsTab;
  label: string;
  href: string;
}[] = [
  {
    key: "credito",
    label: "Tarjetas de crédito",
    href: "/configuracion/cuentas-tarjetas/credito",
  },
  {
    key: "debito",
    label: "Débito y billeteras",
    href: "/configuracion/cuentas-tarjetas/debito",
  },
  {
    key: "cuentas-salida",
    label: "Cuentas de salida",
    href: "/configuracion/cuentas-tarjetas/cuentas-salida",
  },
];

// Cuentas y tarjetas opens its first subtab
export const settingsHref = (section: SettingsSection) =>
  section === "cuentas-tarjetas"
    ? CARDS_ACCOUNTS_TABS[0].href
    : `/configuracion/${section}`;
