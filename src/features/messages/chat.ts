import type { BotReply } from "@/shared/api/hooks/messages";

// Web chat of Mensajes (D49, D57): the same replies the bot sends to Telegram, kept only in this browser
export interface ChatMessage {
  id: string;
  author: "user" | "bot";
  text: string; // user: plain text; bot: HTML with <b> and <i>
  buttons?: BotReply["buttons"];
  attachment?: "image" | "audio";
  createdAt: string;
  failed?: boolean;
}

const HISTORY_KEY = "kogane:chat";
const HISTORY_LIMIT = 200;

export const newMessageId = () => crypto.randomUUID();

// Bot replies after a message or a pressed button. "edit" replaces the message whose button was pressed (as Telegram
// does); the rest are new messages.
export function applyReplies(messages: ChatMessage[], replies: BotReply[], pressedId?: string): ChatMessage[] {
  let next = [...messages];
  for (const reply of replies) {
    const index = reply.edit && pressedId ? next.findIndex((message) => message.id === pressedId) : -1;
    if (index >= 0) {
      next[index] = { ...next[index], text: reply.text, buttons: reply.buttons };
      continue;
    }
    next = [
      ...next,
      { id: newMessageId(), author: "bot", text: reply.text, buttons: reply.buttons, createdAt: new Date().toISOString() },
    ];
  }
  return next;
}

// The bot only sends <b> and <i> (user text comes escaped): anything else is shown as text, never as HTML
export function sanitizeBotHtml(html: string): string {
  return html
    .replace(/<(?!\/?(b|i)>)/g, "&lt;")
    .replace(/\n/g, "<br>");
}

export function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(messages: ChatMessage[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-HISTORY_LIMIT)));
  } catch {
    // private window or full storage: the chat works, it just does not remember
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}
