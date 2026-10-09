import { CHAT_COMMANDS, CHAT_TIME_ZONE } from "../constants/chat";
import type { ChatCommand } from "../constants/chat";

// El menú de comandos aparece mientras se escribe "/algo", sin espacios
export function matchCommands(text: string): ChatCommand[] {
  if (!text.startsWith("/") || /\s/.test(text)) return [];
  const query = text.toLowerCase();
  return CHAT_COMMANDS.filter((item) => item.command.startsWith(query));
}

export function formatRecordingTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

const dayKey = (date: Date) =>
  date.toLocaleDateString("en-CA", { timeZone: CHAT_TIME_ZONE });

export function chatDayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (dayKey(date) === dayKey(now)) return "Hoy";
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (dayKey(date) === dayKey(yesterday)) return "Ayer";
  return date.toLocaleDateString("es-PE", {
    timeZone: CHAT_TIME_ZONE,
    day: "numeric",
    month: "short",
  });
}

export function chatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-PE", {
    timeZone: CHAT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// true cuando el mensaje abre un día distinto al del anterior
export function startsNewDay(previousIso: string | undefined, iso: string) {
  return (
    !previousIso || dayKey(new Date(previousIso)) !== dayKey(new Date(iso))
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Alturas (px) de la onda decorativa de una nota de voz: estable por mensaje, sin audio real
export function waveformBars(seed: string, count = 14): number[] {
  let state = 0;
  for (const char of seed) state = (state * 31 + char.charCodeAt(0)) >>> 0;
  return Array.from({ length: count }, () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return 6 + (state % 14);
  });
}
