import { BellRing, Settings, UsersRound, WalletCards } from "lucide-react";

export const SETTINGS_MENU_LINKS = [
  {
    href: "/configuracion?tab=cuentas",
    label: "Cuentas y tarjetas",
    icon: WalletCards,
    adminOnly: false,
  },
  {
    href: "/configuracion?tab=notificaciones",
    label: "Preferencias de avisos",
    icon: BellRing,
    adminOnly: false,
  },
  {
    href: "/configuracion",
    label: "Configuración",
    icon: Settings,
    adminOnly: false,
  },
  {
    href: "/configuracion?tab=usuarios",
    label: "Administrar usuarios",
    icon: UsersRound,
    adminOnly: true,
  },
];
