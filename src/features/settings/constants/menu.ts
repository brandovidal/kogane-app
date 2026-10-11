import { BellRing, Settings, UsersRound, WalletCards } from "lucide-react";

export const SETTINGS_MENU_LINKS = [
  {
    href: "/configuracion/cuentas-tarjetas",
    label: "Cuentas y tarjetas",
    icon: WalletCards,
    adminOnly: false,
  },
  {
    href: "/configuracion/notificaciones",
    label: "Preferencias de avisos",
    icon: BellRing,
    adminOnly: false,
  },
  {
    href: "/configuracion/general",
    label: "Configuración",
    icon: Settings,
    adminOnly: false,
  },
  {
    href: "/configuracion/usuarios",
    label: "Administrar usuarios",
    icon: UsersRound,
    adminOnly: true,
  },
];
