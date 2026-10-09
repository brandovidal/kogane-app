import { ApiError, api, apiFetch, unwrap } from "@/shared/api/client";
import type {
  ConversationResult,
  OutgoingMessageDto,
} from "../types/message.dto";
export type {
  BotReply,
  ConversationResult,
  OutgoingMessageDto as OutgoingMessage,
} from "../types/message.dto";

export async function sendMessage({
  messageId,
  text,
  file,
  durationSeconds,
}: OutgoingMessageDto): Promise<ConversationResult> {
  const form = new FormData();
  form.set("messageId", messageId);
  if (text) form.set("text", text);
  if (file) form.set("file", file);
  if (durationSeconds != null)
    form.set("durationSeconds", String(Math.round(durationSeconds)));

  const response = await apiFetch("/api/v1/messages", {
    method: "POST",
    body: form,
    headers: { accept: "application/json" },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      response.status,
      body.code ?? "UNKNOWN_ERROR",
      body.message ?? response.statusText,
      body.details,
    );
  return body.data as ConversationResult;
}

export const pressButton = (data: string) =>
  unwrap(api.POST("/v1/messages/actions", { body: { data } }));
