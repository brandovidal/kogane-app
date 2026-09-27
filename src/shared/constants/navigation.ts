import type { NavEntry, NavLink } from "@/shared/types/navigation";

export const NAV: NavEntry[] = [
  {
    href: "/",
    label: "Inicio",
    description: "Vista general de tu presupuesto y próximos pagos.",
    icon: "layout-dashboard",
  },
  {
    label: "Registrar",
    description: "Registra gastos desde mensajes, archivos o borradores.",
    icon: "plus-circle",
    children: [
      {
        href: "/mensajes",
        label: "Mensajes",
        description: "Registra gastos mediante texto, imágenes o audio.",
        icon: "message-circle",
      },
      {
        href: "/importacion",
        label: "Importación",
        description: "Importa archivos de Notion y reconoce estados de cuenta en PDF.",
        icon: "scan-text",
      },
      {
        href: "/borrador",
        label: "Borrador",
        description: "Revisa registros pendientes antes de guardarlos.",
        icon: "inbox",
        badge: "drafts",
      },
    ],
  },
  {
    label: "Gastos",
    description: "Consulta y organiza tus gastos por destino.",
    icon: "receipt",
    children: [
      {
        href: "/dia-a-dia",
        label: "Día a día",
        description: "Compras y gastos cotidianos.",
        icon: "coffee",
      },
      {
        href: "/costos-fijos",
        label: "Costos fijos",
        description: "Pagos mensuales, vencimientos y cuotas.",
        icon: "receipt",
      },
      {
        href: "/plataformas",
        label: "Plataformas",
        description: "Suscripciones y servicios digitales.",
        icon: "tv",
      },
      {
        href: "/tarjetas",
        label: "Tarjetas",
        description: "Movimientos, cierres y pagos de tus tarjetas.",
        icon: "credit-card",
        cards: true,
      },
      {
        href: "/recurrentes",
        label: "Recurrentes",
        description: "Gastos que se repiten según su programación.",
        icon: "repeat",
      },
    ],
  },
  {
    // Cobros (me deben) · Deudas (debo) · Resumen (D114)
    label: "Cobros y deudas",
    description: "Administra lo que te deben y tus pagos pendientes.",
    icon: "hand-coins",
    children: [
      {
        href: "/cobros",
        label: "Cobros",
        description: "Saldos que otras personas te deben.",
        icon: "hand-coins",
      },
      {
        href: "/deudas",
        label: "Deudas",
        description: "Saldos que debes pagar a otras personas.",
        icon: "wallet",
      },
      {
        href: "/resumen-deudas",
        label: "Resumen",
        description: "Balance de cobros y deudas por persona.",
        icon: "file-text",
      },
    ],
  },
  {
    href: "/compromisos",
    label: "Préstamos e inversiones",
    description: "Compromisos, aportes y documentos asociados.",
    icon: "landmark",
  }, // installments are fixed costs (P27)
  {
    href: "/calendario",
    label: "Calendario",
    description: "Fechas de vencimiento, cierres y próximos pagos.",
    icon: "calendar",
  },
  {
    label: "Presupuesto",
    description: "Configura ingresos, categorías y distribución de gastos.",
    icon: "pie-chart",
    children: [
      {
        href: "/relacion-gastos",
        label: "Grupos",
        description: "Distribución del presupuesto y gasto real por grupo.",
        icon: "pie-chart",
      },
      {
        href: "/categorias",
        label: "Categorías",
        description: "Clasifica gastos y define sus límites.",
        icon: "tags",
      },
      {
        href: "/ingresos",
        label: "Ingresos",
        description: "Sueldo mensual e ingresos extra de cada período.",
        icon: "wallet",
      },
    ],
  },
  {
    label: "Reportes",
    description: "Consulta resultados y evolución de tus finanzas.",
    icon: "bar-chart-3",
    children: [
      {
        href: "/resumen",
        label: "Resumen mensual",
        description: "Ingresos, gastos y excedente de cada mes.",
        icon: "bar-chart-3",
      },
    ],
  },
];

// Groups open the first time (nothing remembered yet in this browser)
export const DEFAULT_OPEN_GROUPS = ["Registrar"];

export const SETTINGS_NAV: NavLink = {
  href: "/configuracion",
  label: "Configuración",
  description: "Personas, cuentas, presupuesto y preferencias de avisos.",
  icon: "settings",
};

// Reached from the bell of the header (P20), not from the menu; Ctrl+K still finds it
export const NOTIFICATIONS_LINK = {
  href: "/notificaciones",
  label: "Notificaciones",
};
