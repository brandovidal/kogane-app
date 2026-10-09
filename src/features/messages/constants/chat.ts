export interface ChatCommand {
  command: string;
  description: string;
}

// Mismos comandos que entiende el bot de Telegram
export const CHAT_COMMANDS: readonly ChatCommand[] = [
  { command: "/ayuda", description: "Qué puedo hacer" },
  { command: "/hoy", description: "Gastos de hoy" },
  { command: "/resumen", description: "Resumen del mes" },
  { command: "/borrador", description: "Ir a Borrador" },
  { command: "/deshacer", description: "Deshacer el último registro" },
];

export const CHAT_SUGGESTIONS = [
  { id: "example", label: "almuerzo 25 soles con yape", kind: "text" },
  { id: "help", label: "/ayuda", kind: "text" },
  { id: "capture", label: "Subir captura", kind: "capture" },
] as const;

export const CHAT_TIME_ZONE = "America/Lima";
