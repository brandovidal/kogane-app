import type { ImportUploadCardProps } from "../types/import-types";
import { FileUp } from "lucide-react";
import { PaymentMethodSelect } from "@/features/settings/components/PaymentMethodSelect";
import { PersonSelect } from "@/features/settings/components/PersonSelect";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Switch } from "@/ui/switch";
import { uploadErrorText } from "@/features/statements/lib/statement-view";
import { SOURCE_LABELS } from "@/features/imports/constants/import-options";
import type { ImportSource } from "@/features/imports/types/import-types";
import { useImportUpload } from "../hooks/useImportUpload";

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
    needsCard,
    cardMissing,
    send,
  } = useImportUpload(onRead);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {source === "statement"
            ? "Reconocimiento del estado de cuenta"
            : "Reconocimiento de Notion"}
        </CardTitle>
        {source === "statement" && (
          <p className="text-sm text-muted-foreground">
            Lectura automática del PDF para identificar la tarjeta y sus
            movimientos.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Nada se guarda en tus gastos hasta que lo apruebes. Las capturas
          siguen entrando por{" "}
          <a className="underline" href="/mensajes">
            Mensajes
          </a>
          .
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Qué es</label>
          <Select
            value={source}
            onValueChange={(value) => selectSource(value as ImportSource)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SOURCE_LABELS) as ImportSource[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SOURCE_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            {source === "notion"
              ? "El ZIP que exporta Notion o sus CSV"
              : "El PDF del banco"}
          </label>
          <Input
            key={source}
            type="file"
            multiple={source === "notion"}
            accept={source === "notion" ? ".zip,.csv" : "application/pdf"}
            onChange={(event) =>
              selectFiles(Array.from(event.target.files ?? []))
            }
          />
          {source === "notion" && (
            <p className="text-xs text-muted-foreground">
              Exporta "Seguimiento financiero" en Markdown y CSV. Se leen solo
              los *_all.csv
            </p>
          )}
        </div>

        {source === "statement" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="statement-card" className="text-sm font-medium">
                Tarjeta {needsCard ? "*" : ""}
              </label>
              <PaymentMethodSelect
                id="statement-card"
                type="credit_card"
                allowEmpty={!needsCard}
                aria-required={needsCard}
                aria-invalid={cardMissing}
                aria-describedby="statement-card-help"
                className={cardMissing ? "border-destructive" : undefined}
                value={cardId}
                onChange={setCardId}
                placeholder={
                  needsCard ? "Selecciona la tarjeta" : "Detectar en el PDF"
                }
              />
              <p
                id="statement-card-help"
                role={cardMissing ? "alert" : undefined}
                className={`text-xs ${cardMissing ? "text-destructive" : "text-muted-foreground"}`}
              >
                {needsCard
                  ? "No se pudo identificar la tarjeta del PDF. Selecciónala para previsualizar."
                  : ""}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Persona (opcional)</label>
              <PersonSelect
                allowEmpty
                value={personId}
                onChange={setPersonId}
                placeholder="Detectar en el PDF"
              />
            </div>
          </div>
        )}
        {source === "statement" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Contraseña del PDF {needsPassword ? "*" : "(opcional)"}
            </label>
            <Input
              type="password"
              placeholder="Se prueban los N.º de documento guardados"
              autoComplete="off"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={needsPassword}
            />
            {password && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Switch
                  checked={savePassword}
                  onCheckedChange={setSavePassword}
                />
                Guardarla como N.º de documento de la persona del estado de
                cuenta (si abre el PDF)
              </label>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">
            {source === "statement"
              ? uploadErrorText(error.code, reason)
              : error.message}
          </p>
        )}
        {!error && upload.isError && (
          <p className="text-sm text-destructive">No se pudo subir.</p>
        )}
        <Button
          onClick={send}
          disabled={!files.length || upload.isPending || cardMissing}
        >
          <FileUp className="mr-1 h-4 w-4" />{" "}
          {upload.isPending ? "Leyendo…" : "Previsualizar"}
        </Button>
      </CardContent>
    </Card>
  );
}
