import { Check, ImageIcon, Mic, Pencil, X } from "lucide-react";
import { Button } from "@/ui/button";
import { cn } from "@/shared/utils/cn";
import {
  sanitizeBotHtml,
  type ChatMessage,
} from "@/features/messages/lib/chat";
import {
  chatTime,
  formatRecordingTime,
  waveformBars,
} from "@/features/messages/lib/chat-view";
import {
  actionRole,
  buttonText,
  parseDraftCard,
  type ChatActionRole,
} from "@/features/messages/lib/draft-card";

interface MessageBubbleProps {
  message: ChatMessage;
  onPress: (message: ChatMessage, data: string) => void;
  busy: boolean;
}

const ACTION_ICON: Partial<Record<ChatActionRole, typeof Check>> = {
  save: Check,
  edit: Pencil,
  discard: X,
};

function BotHtml({ html }: { html: string }) {
  if (!html) return null;
  return (
    <p
      className="break-words"
      dangerouslySetInnerHTML={{ __html: sanitizeBotHtml(html) }}
    />
  );
}

// A message of the chat: the user's on the right, the bot's (HTML + inline buttons, like Telegram) on the left.
// A draft summary from the bot is shown as a card with its actions (boards de Mensajes, M1)
export function MessageBubble({ message, onPress, busy }: MessageBubbleProps) {
  const isUser = message.author === "user";
  const card = isUser ? null : parseDraftCard(message.text);
  const buttons = (message.buttons ?? []).flat();
  const actions = card
    ? buttons.filter((button) => actionRole(button.label))
    : [];
  const options = buttons.filter((button) => !actions.includes(button));

  return (
    <div
      className={cn(
        "flex items-end gap-2.5",
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
            "rounded-2xl border px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-br-sm border-indigo-400/40 bg-indigo-100 text-indigo-950 dark:border-indigo-300/30 dark:bg-indigo-300/15 dark:text-foreground"
              : "rounded-bl-sm bg-foreground/5 text-foreground",
            message.attachment === "image" && "p-2",
            message.failed && "border-destructive",
          )}
        >
          {message.attachment === "image" && (
            <div className="space-y-1.5">
              {message.previewUrl ? (
                <img
                  src={message.previewUrl}
                  alt={message.fileName ?? "Imagen enviada"}
                  className="max-h-48 w-full rounded-lg object-cover"
                />
              ) : null}
              <div className="flex items-center gap-1.5 px-2 text-xs text-muted-foreground">
                <ImageIcon className="size-3.5 shrink-0" />
                <span className="truncate">{message.fileName ?? "Imagen"}</span>
              </div>
            </div>
          )}
          {message.attachment === "audio" && (
            <div
              className="flex items-center gap-2.5"
              role="img"
              aria-label="Nota de voz"
            >
              <Mic className="size-4 shrink-0" />
              <span className="flex h-6 items-center gap-0.5">
                {waveformBars(message.id).map((height, index) => (
                  <i
                    key={index}
                    className="w-0.5 rounded-full bg-current opacity-70"
                    style={{ height }}
                  />
                ))}
              </span>
              {message.durationSeconds != null && (
                <span className="ml-auto pl-3 text-xs tabular-nums">
                  {formatRecordingTime(message.durationSeconds)}
                </span>
              )}
            </div>
          )}

          {message.attachment === "audio" ? null : isUser ? (
            message.text && (
              <p
                className={cn(
                  "whitespace-pre-wrap break-words",
                  message.attachment === "image" && "px-2 pb-1 pt-2",
                )}
              >
                {message.text}
              </p>
            )
          ) : card ? (
            <div className="space-y-3">
              <BotHtml html={card.before} />
              <section
                aria-label={`Borrador: ${card.title}`}
                className="min-w-64 space-y-3 rounded-xl border bg-background/40 p-4"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <b className="text-base">{card.title}</b>
                  <em className="text-xl font-bold not-italic tabular-nums">
                    {card.amount}
                  </em>
                </div>
                {card.tags.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5">
                    {card.tags.map((tag, index) => (
                      <li
                        key={tag}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          index === 0
                            ? "bg-indigo-400/20 text-indigo-700 dark:text-indigo-200"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
                {actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {actions.map((button) => {
                      const role = actionRole(button.label);
                      const Icon = role ? ACTION_ICON[role] : undefined;
                      return (
                        <Button
                          key={button.data}
                          size="sm"
                          variant={
                            role === "save"
                              ? "default"
                              : role === "discard"
                                ? "ghost"
                                : "outline"
                          }
                          className={cn(
                            role === "discard" &&
                              "text-destructive hover:text-destructive",
                          )}
                          disabled={busy}
                          onClick={() => onPress(message, button.data)}
                        >
                          {Icon && <Icon className="size-4" />}
                          {buttonText(button.label)}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </section>
              <BotHtml html={card.after} />
            </div>
          ) : (
            <BotHtml html={message.text} />
          )}

          {message.failed && (
            <p className="mt-1 text-xs text-destructive">No se pudo enviar</p>
          )}

          {options.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {options.map((button) => (
                <Button
                  key={button.data}
                  size="sm"
                  variant="outline"
                  className="h-7 rounded-full bg-transparent px-3 text-xs"
                  disabled={busy}
                  onClick={() => onPress(message, button.data)}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        <time
          dateTime={message.createdAt}
          className="px-1 text-[11px] text-muted-foreground"
        >
          {chatTime(message.createdAt)}
        </time>
      </div>
    </div>
  );
}
