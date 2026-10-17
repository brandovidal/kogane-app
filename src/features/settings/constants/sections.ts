import { BellRing, History, Settings, UserRound, UsersRound, WalletCards, Contact, type LucideIcon } from "lucide-react";
import type { CardsAccountsTab, SettingsSection } from "../types/navigation";

export type { SettingsSection, CardsAccountsTab } from "../types/navigation";

export const SETTINGS_SECTION = {
  PERFIL: "perfil",
  GENERAL: "general",
  NOTIFICACIONES: "notificaciones",
  CUENTAS_TARJETAS: "cuentas-tarjetas",
  PERSONAS: "personas",
  HISTORIAL: "historial",
  USUARIOS: "usuarios",
} as const;

export const CARDS_ACCOUNTS_TAB = {
  CREDITO: "credito",
  DEBITO: "debito",
  CUENTAS_SALIDA: "cuentas-salida",
} as const;

export const SETTINGS_PAGE_NAMES: Record<SettingsSection, string> = {
  [SETTINGS_SECTION.PERFIL]: "Perfil",
  [SETTINGS_SECTION.GENERAL]: "General",
  [SETTINGS_SECTION.NOTIFICACIONES]: "Notificaciones",
  [SETTINGS_SECTION.CUENTAS_TARJETAS]: "Cuentas y tarjetas",
  [SETTINGS_SECTION.PERSONAS]: "Personas",
  [SETTINGS_SECTION.USUARIOS]: "Usuarios",
  [SETTINGS_SECTION.HISTORIAL]: "Historial de cambios",
};

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
      { key: SETTINGS_SECTION.GENERAL, label: SETTINGS_PAGE_NAMES[SETTINGS_SECTION.GENERAL], icon: Settings },
      { key: SETTINGS_SECTION.PERFIL, label: SETTINGS_PAGE_NAMES[SETTINGS_SECTION.PERFIL], icon: UserRound },
      { key: SETTINGS_SECTION.NOTIFICACIONES, label: SETTINGS_PAGE_NAMES[SETTINGS_SECTION.NOTIFICACIONES], icon: BellRing },
    ],
  },
  {
    label: "Catálogos",
    items: [
      { key: SETTINGS_SECTION.CUENTAS_TARJETAS, label: SETTINGS_PAGE_NAMES[SETTINGS_SECTION.CUENTAS_TARJETAS], icon: WalletCards },
      { key: SETTINGS_SECTION.PERSONAS, label: SETTINGS_PAGE_NAMES[SETTINGS_SECTION.PERSONAS], icon: Contact },
    ],
  },
  {
    label: "Administración",
    items: [
      { key: SETTINGS_SECTION.USUARIOS, label: SETTINGS_PAGE_NAMES[SETTINGS_SECTION.USUARIOS], icon: UsersRound, adminOnly: true },
      { key: SETTINGS_SECTION.HISTORIAL, label: SETTINGS_PAGE_NAMES[SETTINGS_SECTION.HISTORIAL], icon: History },
    ],
  },
];

export const CARDS_ACCOUNTS_TABS: {
  key: CardsAccountsTab;
  label: string;
  href: string;
}[] = [
  {
    key: CARDS_ACCOUNTS_TAB.CREDITO,
    label: "Tarjetas de crédito",
    href: `/configuracion/cuentas-tarjetas/${CARDS_ACCOUNTS_TAB.CREDITO}`,
  },
  {
    key: CARDS_ACCOUNTS_TAB.DEBITO,
    label: "Débito y billeteras",
    href: `/configuracion/cuentas-tarjetas/${CARDS_ACCOUNTS_TAB.DEBITO}`,
  },
  {
    key: CARDS_ACCOUNTS_TAB.CUENTAS_SALIDA,
    label: "Cuentas de salida",
    href: `/configuracion/cuentas-tarjetas/${CARDS_ACCOUNTS_TAB.CUENTAS_SALIDA}`,
  },
];

// Cuentas y tarjetas opens its first subtab
export const settingsHref = (section: SettingsSection) =>
  section === SETTINGS_SECTION.CUENTAS_TARJETAS ? CARDS_ACCOUNTS_TABS[0].href : `/configuracion/${section}`;
