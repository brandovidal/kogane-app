import type { ImportUploadCardProps } from "../types/import-types";
import { AlertCircle, FileUp, Lock, ShieldCheck } from "lucide-react";
import { PaymentMethodSelect } from "@/features/settings/components/PaymentMethodSelect";
import { PersonSelect } from "@/features/settings/components/PersonSelect";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Switch } from "@/ui/switch";
import { cn } from "@/shared/utils/cn";
import { uploadErrorText } from "@/features/statements/lib/statement-view";
import { SOURCE_LABELS } from "@/features/imports/constants/import-options";
import type { ImportSource } from "@/features/imports/types/import-types";
import { useImportUpload } from "../hooks/useImportUpload";
import { ImportDropzone } from "./ImportDropzone";
import { ImportFileCard } from "./ImportFileCard";
import { ImportProcessing } from "./ImportProcessing";

const SOURCE_SHORT: Record<ImportSource, string> = {
  statement: "Estado de cuenta",
  notion: "Notion",
};

// Importación en un solo paso por pantalla (boards I1–I6): elegir → archivo listo → (contraseña) → procesando
export function ImportUploadCard({ onRead }: ImportUploadCardProps) {
  const {
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
    cardMissing,
    cardName,
    detectedCardId,
    fileError,
    progress,
    cancel,
    reset,
    send,
  } = useImportUpload(onRead);

  const statement = source === "statement";
  const hasFiles = files.length > 0;
  const passwordWrong = needsPassword && reason !== "missing";

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <div
        role="tablist"
        aria-label="Qué vas a importar"
        className="inline-flex rounded-lg bg-muted p-1 text-sm"
      >
        {(Object.keys(SOURCE_SHORT) as ImportSource[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={source === key}
            disabled={upload.isPending}
            onClick={() => selectSource(key)}
            className={cn(
              "rounded-md px-3 py-1 font-medium transition-colors",
              source === key
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {SOURCE_SHORT[key]}
          </button>
        ))}
      </div>

      {!hasFiles && <ImportDropzone source={source} onFiles={selectFiles} />}

      {hasFiles && upload.isPending && (
        <ImportProcessing
          file={files[0]}
          progress={progress}
          onCancel={cancel}
        />
      )}

      {hasFiles && !upload.isPending && (
        <div className="space-y-4">
          <ImportFileCard files={files} error={fileError} onRemove={reset} />
          {!fileError && statement && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="statement-card" className="text-sm font-medium">
                  Tarjeta *
                  {detectedCardId && detectedCardId === cardId && (
                    <span className="ml-2 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-xs font-normal text-emerald-600">
                      detectada
                    </span>
                  )}
                </label>
                <PaymentMethodSelect
                  id="statement-card"
                  type="credit_card"
                  allowEmpty={false}
                  aria-required
                  aria-invalid={cardMissing}
                  className={cardMissing ? "border-destructive" : undefined}
                  value={cardId}
                  onChange={setCardId}
                  placeholder="Selecciona una tarjeta"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Persona</label>
                <PersonSelect
                  allowEmpty
                  value={personId}
                  onChange={setPersonId}
                  placeholder="Detectar en el PDF"
                />
              </div>
            </div>
          )}
          {!fileError && statement && cardMissing && (
            <p
              role="alert"
              className="flex items-center gap-1.5 text-xs text-destructive"
            >
              <AlertCircle className="size-3.5" /> Selecciona la tarjeta para
              continuar
            </p>
          )}

          {!fileError && statement && needsPassword && (
            <div className="space-y-2 rounded-xl border bg-card p-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Lock className="size-4" /> Este PDF está protegido
              </p>
              <div className="space-y-1.5">
                <label
                  htmlFor="statement-password"
                  className="text-xs font-medium"
                >
                  Contraseña
                </label>
                <Input
                  id="statement-password"
                  type="password"
                  autoFocus
                  placeholder="Contraseña del PDF"
                  autoComplete="off"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={passwordWrong}
                  className={passwordWrong ? "border-destructive" : undefined}
                />
                {error && (
                  <p role="alert" className="text-xs text-destructive">
                    {uploadErrorText(error.code, reason)}
                  </p>
                )}
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch
                  checked={savePassword}
                  onCheckedChange={setSavePassword}
                />
                Recordar para {cardName ?? "esta tarjeta"}
                <a
                  href="/configuracion"
                  className="ml-auto underline-offset-2 hover:underline"
                >
                  Gestionar en Configuración
                </a>
              </label>
            </div>
          )}
          {!fileError && statement && !needsPassword && !error && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Si el PDF tiene contraseña,
              probamos la guardada y te la pedimos solo si no abre.
            </p>
          )}

          {error && !needsPassword && (
            <p role="alert" className="text-sm text-destructive">
              {statement ? uploadErrorText(error.code, reason) : error.message}
            </p>
          )}
          {!error && upload.isError && (
            <p role="alert" className="text-sm text-destructive">
              No se pudo subir.
            </p>
          )}

          <div className="flex justify-end">
            <Button
              onClick={send}
              disabled={!!fileError || cardMissing || upload.isPending}
            >
              <FileUp className="size-4" /> Previsualizar
            </Button>
          </div>
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">
        {SOURCE_LABELS[source]} · nada se guarda hasta que lo apruebes. Las
        capturas entran por{" "}
        <a className="underline" href="/mensajes">
          Mensajes
        </a>
        .
      </p>
    </div>
  );
}
