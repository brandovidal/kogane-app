// Public module API. Internal files import concrete modules to avoid cycles.
export type { ChatInputValue } from "./components/ChatInput";
export { ChatInput } from "./components/ChatInput";
export { ChatPage } from "./components/ChatPage";
export { MessageBubble } from "./components/MessageBubble";
export type {
  ConversationResult,
  BotReply,
  OutgoingMessage,
} from "./hooks/messages";
export { sendMessage, pressButton } from "./hooks/messages";
export type { ChatMessage } from "./lib/chat";
export {
  newMessageId,
  applyReplies,
  sanitizeBotHtml,
  loadHistory,
  saveHistory,
  clearHistory,
} from "./lib/chat";
