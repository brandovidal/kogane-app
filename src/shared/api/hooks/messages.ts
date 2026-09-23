import { ApiError, api, unwrap, type Schemas } from "../client";

export type ConversationResult = NonNullable<Schemas["ConversationResultResponseDto"]["data"]>;
export type BotReply = ConversationResult["replies"][number];

export interface OutgoingMessage {
  messageId: string;
  text?: string;
  file?: File;
  durationSeconds?: number;
}

// Mensajes (D49): the web is one more channel of the bot. Multipart because of images and voice notes, so it goes
// through fetch; the answer has the same envelope as the rest of kogane-api.
export async function sendMessage({ messageId, text, file, durationSeconds }: OutgoingMessage): Promise<ConversationResult> {
  const form = new FormData();
  form.set("messageId", messageId);
  if (text) form.set("text", text);
  if (file) form.set("file", file);
  if (durationSeconds != null) form.set("durationSeconds", String(Math.round(durationSeconds)));

  const response = await fetch("/api/v1/messages", { method: "POST", body: form, headers: { accept: "application/json" } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, body.code ?? "UNKNOWN_ERROR", body.message ?? response.statusText, body.details);
  }
  return body.data as ConversationResult;
}

// A pressed button of a bot reply
export const pressButton = (data: string) => unwrap(api.POST("/v1/messages/actions", { body: { data } }));
