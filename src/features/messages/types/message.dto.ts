import type { Schemas } from "@/shared/api/client";

export type ConversationResult = NonNullable<
  Schemas["ConversationResultResponseDto"]["data"]
>;
export type BotReply = ConversationResult["replies"][number];

export interface OutgoingMessageDto {
  messageId: string;
  text?: string;
  file?: File;
  durationSeconds?: number;
}
