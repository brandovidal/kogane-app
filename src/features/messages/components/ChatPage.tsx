import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/ui/button";
import { pressButton, sendMessage } from "@/shared/api/hooks/messages";
import { errorMessage } from "@/shared/api/hooks/use-api-mutation";
import { withQuery } from "@/shared/api/query";
import { applyReplies, clearHistory, loadHistory, newMessageId, saveHistory, type ChatMessage } from "../chat";
import { ChatInput, type ChatInputValue } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

const WELCOME: ChatMessage = {
  id: "welcome",
  author: "bot",
  text: "👋 Escríbeme tus gastos, manda una captura de Yape o Plin, o graba una nota de voz. Prueba con <i>almuerzo 25 soles con yape</i> o <i>/ayuda</i>.",
  createdAt: new Date(0).toISOString(),
};

// Mensajes (D49, D57): chat with Kogane over HTTP, the same conversation as Telegram (channel web)
function ChatPageView() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMessages(loadHistory()), []);
  useEffect(() => {
    if (messages.length) saveHistory(messages);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Saving from the chat creates records and moves Borrador: refresh the other screens
  const refreshData = () =>
    ["drafts", "expenses", "summary", "debts"].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

  const send = async ({ text, file, attachment, durationSeconds }: ChatInputValue) => {
    const id = newMessageId();
    const own: ChatMessage = {
      id,
      author: "user",
      text: text || (attachment === "audio" ? "🎙️" : ""),
      attachment,
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, own]);
    setBusy(true);
    try {
      const result = await sendMessage({ messageId: id, text: text || undefined, file, durationSeconds });
      setMessages((current) => applyReplies(current, result.replies));
      refreshData();
    } catch (error) {
      setMessages((current) => current.map((message) => (message.id === id ? { ...message, failed: true } : message)));
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const press = async (message: ChatMessage, data: string) => {
    setBusy(true);
    try {
      const result = await pressButton(data);
      setMessages((current) => applyReplies(current, result.replies, message.id));
      if (result.notice) toast(result.notice);
      refreshData();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    clearHistory();
    setMessages([]);
  };

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] flex-col md:-m-6">
      <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
        <span>El historial se guarda solo en este navegador</span>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={reset} disabled={!messages.length}>
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Limpiar
        </Button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-3">
          <MessageBubble message={WELCOME} onPress={press} busy={busy} />
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onPress={press} busy={busy} />
          ))}
          {busy && <p className="text-xs text-muted-foreground">Kogane está escribiendo…</p>}
          <div ref={endRef} />
        </div>
      </div>
      <ChatInput onSend={send} disabled={busy} />
    </div>
  );
}

export const ChatPage = withQuery(ChatPageView);
