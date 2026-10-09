import { useRef, useState } from "react";
import { ApiError } from "@/shared/api/client";
import { useUploadNotion } from "@/features/imports/hooks/imports";
import { useUploadStatement } from "@/features/statements/hooks/statements";
import { useCreditCards } from "@/shared/api/hooks/catalogs";
import type { ImportSource } from "@/features/imports/types/import-types";
import { detectCard, validateUploadFile } from "../lib/upload-flow";
import { useEstimatedProgress } from "./useEstimatedProgress";

export function useImportUpload(onRead: (key: string) => void) {
  const [source, setSource] = useState<ImportSource>("statement");
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [cardId, setCardId] = useState<string | null>(null);
  const [personId, setPersonId] = useState<string | null>(null);
  const [savePassword, setSavePassword] = useState(true);
  const [fileError, setFileError] = useState<string | null>(null);
  const [detectedCardId, setDetectedCardId] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const cards = useCreditCards().data ?? [];
  const notion = useUploadNotion();
  const statement = useUploadStatement();
  const upload = source === "notion" ? notion : statement;
  const error = upload.error instanceof ApiError ? upload.error : null;
  const reason = (error?.details as { reason?: string } | undefined)?.reason;
  const needsPassword =
    source === "statement" && error?.code === "STATEMENT_PASSWORD";
  const needsCard = source === "statement" && files.length > 0;
  const cardMissing = needsCard && !cardId;
  const progress = useEstimatedProgress(upload.isPending);
  const cardName = cards.find((card) => card.id === cardId)?.name ?? null;

  const reset = () => {
    setFiles([]);
    setFileError(null);
    setDetectedCardId(null);
    setPassword("");
    setCardId(null);
    setPersonId(null);
    notion.reset();
    statement.reset();
  };

  const send = () => {
    if (!files.length || upload.isPending || cardMissing) return;
    if (source === "notion") {
      notion.mutate(files, {
        onSuccess: (batch) => (reset(), onRead(`notion:${batch.id}`)),
      });
      return;
    }
    controller.current = new AbortController();
    statement.mutate(
      {
        signal: controller.current.signal,
        file: files[0],
        password: password || undefined,
        paymentMethodId: cardId ?? undefined,
        personId: personId ?? undefined,
        savePassword,
      },
      { onSuccess: (read) => (reset(), onRead(`statement:${read.id}`)) },
    );
  };

  const selectSource = (value: ImportSource) => {
    setSource(value);
    reset();
  };
  const selectFiles = (value: File[]) => {
    notion.reset();
    statement.reset();
    const invalid = value
      .map((file) => validateUploadFile(file, source))
      .find(Boolean);
    setFileError(invalid ?? null);
    setFiles(value);
    if (invalid || source !== "statement" || !value[0]) return;
    const detected = detectCard(value[0].name, cards);
    setDetectedCardId(detected?.id ?? null);
    if (detected && !cardId) setCardId(detected.id);
  };
  const cancel = () => {
    controller.current?.abort();
    statement.reset();
    notion.reset();
  };
  return {
    source,
    selectSource,
    files,
    selectFiles,
    password,
    setPassword,
    cardId,
    setCardId,
    personId,
    setPersonId,
    savePassword,
    setSavePassword,
    upload,
    error,
    reason,
    needsPassword,
    needsCard,
    cardMissing,
    cardName,
    detectedCardId,
    fileError,
    progress,
    cancel,
    reset,
    send,
  };
}
