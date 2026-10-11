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

export const settingsHref = (section: SettingsSection) =>
  `/configuracion/${section}`;
