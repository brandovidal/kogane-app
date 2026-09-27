import { useState } from "react";
import { ApiError } from "@/shared/api/client";
import { useUploadNotion } from "@/features/imports/hooks/imports";
import { useUploadStatement } from "@/features/statements/hooks/statements";
import type { ImportSource } from "@/features/imports/types/import-types";

export function useImportUpload(onRead: (key: string) => void) {
  const [source, setSource] = useState<ImportSource>("statement");
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [cardId, setCardId] = useState<string | null>(null);
  const [personId, setPersonId] = useState<string | null>(null);
  const [savePassword, setSavePassword] = useState(true);
  const notion = useUploadNotion();
  const statement = useUploadStatement();
  const upload = source === "notion" ? notion : statement;
  const error = upload.error instanceof ApiError ? upload.error : null;
  const reason = (error?.details as { reason?: string } | undefined)?.reason;
  const needsPassword =
    source === "statement" && error?.code === "STATEMENT_PASSWORD";

  const needsCard =
    source === "statement" &&
    error?.code === "STATEMENT_UNREADABLE" &&
    reason?.startsWith("card not found") === true;
  const cardMissing = needsCard && !cardId;

  const reset = () => {
    setFiles([]);
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
    statement.mutate(
      {
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
    setFiles(value);
    notion.reset();
    statement.reset();
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
    send,
  };
}
