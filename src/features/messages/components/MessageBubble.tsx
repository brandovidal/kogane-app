import { ImageIcon, Mic } from "lucide-react";
import { Button } from "@/ui/button";
import { cn } from "@/shared/utils/cn";
import {
  sanitizeBotHtml,
  type ChatMessage,
} from "@/features/messages/lib/chat";
import { chatTime } from "@/features/messages/lib/chat-view";

interface MessageBubbleProps {
  message: ChatMessage;
  onPress: (message: ChatMessage, data: string) => void;
  busy: boolean;
}

// A message of the chat: the user's on the right, the bot's (HTML + inline buttons, like Telegram) on the left
export function MessageBubble({ message, onPress, busy }: MessageBubbleProps) {
  const isUser = message.author === "user";

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <span
          aria-hidden="true"
          className="mb-5 flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background"
        >
          K
        </span>
      )}
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-1 sm:max-w-[70%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl border px-4 py-2 text-sm shadow-sm",
            isUser
              ? "border-border/60 bg-secondary text-secondary-foreground"
              : "bg-card text-foreground",
            message.failed && "border-destructive",
          )}
        >
          {message.attachment && (
            <div className="mb-1 flex items-center gap-1 text-xs opacity-80">
              {message.attachment === "image" ? (
                <ImageIcon className="h-3.5 w-3.5" />
              ) : (
                <Mic className="h-3.5 w-3.5" />
              )}
              {message.attachment === "image" ? "Imagen" : "Nota de voz"}
            </div>
          )}
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
          ) : (
            <p
              className="break-words"
              dangerouslySetInnerHTML={{
                __html: sanitizeBotHtml(message.text),
              }}
            />
          )}
          {message.failed && (
            <p className="mt-1 text-xs text-destructive">No se pudo enviar</p>
          )}

          {message.buttons?.length ? (
            <div className="mt-2 space-y-1">
              {message.buttons.map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-wrap gap-1">
                  {row.map((button) => (
                    <Button
                      key={button.data}
                      size="sm"
                      variant="outline"
                      className="h-7 flex-1 bg-background text-xs"
                      disabled={busy}
                      onClick={() => onPress(message, button.data)}
                    >
                      {button.label}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {message.id !== "welcome" && (
          <time
            dateTime={message.createdAt}
            className="px-1 text-[11px] text-muted-foreground"
          >
            {chatTime(message.createdAt)}
          </time>
        )}
      </div>
    </div>
  );
}
