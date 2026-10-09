import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowUp,
  ImagePlus,
  Mic,
  Slash,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/ui/button";
import { cn } from "@/shared/utils/cn";
import { CHAT_SUGGESTIONS } from "@/features/messages/constants/chat";
import {
  formatFileSize,
  formatRecordingTime,
  matchCommands,
} from "@/features/messages/lib/chat-view";

// Voice notes longer than this are rejected by the bot (MAX_AUDIO_SECONDS in kogane-api)
const MAX_AUDIO_SECONDS = 60;

const WAVE_BARS = 26;

// Nivel del micrófono (0–1) cada 100 ms para dibujar la onda mientras se graba
function startMeter(stream: MediaStream, onLevel: (level: number) => void) {
  try {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    context.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const timer = setInterval(() => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const value of data) sum += ((value - 128) / 128) ** 2;
      onLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
    }, 100);
    return {
      stop: () => {
        clearInterval(timer);
        void context.close();
      },
    };
  } catch {
    return { stop: () => {} };
  }
}

export interface ChatInputValue {
  text: string;
  file?: File;
  attachment?: "image" | "audio";
  durationSeconds?: number;
}

interface ChatInputProps {
  onSend: (value: ChatInputValue) => void;
  disabled: boolean;
  /** Muestra las sugerencias rápidas (conversación sin mensajes del usuario). */
  showSuggestions?: boolean;
}

// Text, an image with an optional caption, or a voice note (layout of lp-clemente-restaurante, D49)
export function ChatInput({
  onSend,
  disabled,
  showSuggestions = false,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>([]);
  const meterRef = useRef<{ stop: () => void } | null>(null);
  const [activeCommand, setActiveCommand] = useState(0);
  const cancelledRef = useRef(false);
  const commands = matchCommands(text);
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    if (!image) return setImageUrl(undefined);
    const url = URL.createObjectURL(image);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const startedAtRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(
    () => () =>
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop()),
    [],
  );

  useEffect(() => {
    if (!recording) return;
    setElapsed(0);
    const timer = setInterval(
      () => setElapsed((Date.now() - startedAtRef.current) / 1000),
      250,
    );
    return () => clearInterval(timer);
  }, [recording]);

  const pickCommand = (command: string) => {
    setText(command);
    setActiveCommand(0);
    textRef.current?.focus();
  };

  const send = () => {
    if (disabled) return;
    if (image) {
      onSend({ text: text.trim(), file: image, attachment: "image" });
    } else if (text.trim()) {
      onSend({ text: text.trim() });
    } else {
      return;
    }
    setText("");
    setImage(null);
    textRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (commands.length) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActiveCommand(
          (current) => (current + step + commands.length) % commands.length,
        );
        return;
      }
      if (
        event.key === "Tab" ||
        (event.key === "Enter" && text !== commands[activeCommand]?.command)
      ) {
        event.preventDefault();
        pickCommand(commands[activeCommand].command);
        return;
      }
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      cancelledRef.current = false;
      recorder.onstop = () => {
        meterRef.current?.stop();
        stream.getTracks().forEach((track) => track.stop());
        if (cancelledRef.current) return;
        const durationSeconds = (Date.now() - startedAtRef.current) / 1000;
        const type = recorder.mimeType.split(";")[0] || "audio/webm";
        const file = new File(chunks, `nota-${Date.now()}.webm`, { type });
        onSend({ text: "", file, attachment: "audio", durationSeconds });
      };
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start();
      meterRef.current = startMeter(stream, (level) =>
        setLevels((current) => [...current, level].slice(-WAVE_BARS)),
      );
      setLevels([]);
      setRecording(true);
      // the bot does not read longer notes: stop at the limit
      setTimeout(
        () => recorder.state === "recording" && stopRecording(),
        MAX_AUDIO_SECONDS * 1000,
      );
    } catch {
      toast.error("No pude usar el micrófono.");
    }
  };

  const cancelRecording = () => {
    cancelledRef.current = true;
    stopRecording();
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  const barClass =
    "flex items-center gap-2 rounded-full border bg-card px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary/30";

  return (
    <div className="border-t p-3">
      <div className="mx-auto max-w-3xl">
        {showSuggestions && !recording && !text && !image && (
          <div className="mb-2 flex flex-wrap justify-center gap-2">
            {CHAT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                disabled={disabled}
                onClick={() =>
                  suggestion.kind === "capture"
                    ? fileRef.current?.click()
                    : pickCommand(suggestion.label)
                }
                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {suggestion.kind === "capture" ? (
                  <ImagePlus className="size-3.5" />
                ) : suggestion.label.startsWith("/") ? (
                  <Slash className="size-3.5" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
        {image && (
          <div className="mb-2 flex items-center gap-3 rounded-xl border bg-muted/40 p-2">
            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                className="size-16 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{image.name}</p>
              <p className="text-xs text-muted-foreground">
                Imagen · {formatFileSize(image.size)} · lista para enviar
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              onClick={() => setImage(null)}
              aria-label="Quitar imagen"
            >
              <X className="size-4" />
            </Button>
          </div>
        )}
        <div className="relative">
          {commands.length > 0 && (
            <ul
              role="listbox"
              aria-label="Comandos"
              className="absolute bottom-full left-0 mb-2 w-full max-w-sm overflow-hidden rounded-xl border bg-popover p-1 shadow-lg"
            >
              {commands.map((item, index) => (
                <li
                  key={item.command}
                  role="option"
                  aria-selected={index === activeCommand}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActiveCommand(index)}
                    onClick={() => pickCommand(item.command)}
                    className={cn(
                      "flex w-full items-baseline gap-4 rounded-lg px-3 py-2 text-left text-sm",
                      index === activeCommand && "bg-muted",
                    )}
                  >
                    <span className="w-20 font-semibold">{item.command}</span>
                    <span className="text-muted-foreground">
                      {item.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              setImage(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
          {recording ? (
            <div
              className={barClass}
              role="status"
              aria-label="Grabando nota de voz"
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-destructive"
                onClick={cancelRecording}
                aria-label="Cancelar grabación"
              >
                <Trash2 className="size-5" />
              </Button>
              <span className="size-2 animate-pulse rounded-full bg-destructive" />
              <span className="text-sm font-semibold tabular-nums">
                {formatRecordingTime(elapsed)}
              </span>
              <span className="flex-1 truncate text-xs text-muted-foreground">
                <span
                  className="flex h-8 items-center gap-0.5"
                  aria-hidden="true"
                >
                  {Array.from({ length: WAVE_BARS }, (_, index) => {
                    const level = levels[index - (WAVE_BARS - levels.length)];
                    return (
                      <i
                        key={index}
                        className="w-0.5 rounded-full bg-primary/70"
                        style={{ height: 4 + (level ?? 0) * 26 }}
                      />
                    );
                  })}
                </span>
              </span>
              <Button
                size="icon"
                className="size-9 shrink-0 rounded-full"
                onClick={stopRecording}
                aria-label="Detener y enviar"
              >
                <ArrowUp className="size-5" />
              </Button>
            </div>
          ) : (
            <div className={barClass}>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0"
                onClick={() => fileRef.current?.click()}
                disabled={disabled}
                aria-label="Adjuntar captura"
              >
                <ImagePlus className="size-5" />
              </Button>
              <textarea
                ref={textRef}
                rows={1}
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setActiveCommand(0);
                }}
                onKeyDown={onKeyDown}
                placeholder={
                  image
                    ? "Añade un texto opcional (ej: persona dany)..."
                    : "Ej: almuerzo 25 soles con yape"
                }
                disabled={disabled}
                className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm focus:outline-none"
              />
              {!(text.trim() || image) && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 shrink-0 rounded-full"
                  onClick={startRecording}
                  disabled={disabled}
                  aria-label="Grabar nota de voz"
                >
                  <Mic className="size-5" />
                </Button>
              )}
              <Button
                size="icon"
                className="size-9 shrink-0 rounded-full"
                onClick={send}
                disabled={disabled || !(text.trim() || image)}
                aria-label="Enviar"
              >
                <ArrowUp className="size-5" />
              </Button>
            </div>
          )}
        </div>
        <p className="mt-1.5 text-center text-xs text-muted-foreground">
          {recording ? (
            "Toca enviar para mandar · la papelera cancela"
          ) : image ? (
            <>
              Añade un texto opcional (ej:{" "}
              <kbd className="rounded border px-1">persona dany</kbd>) ·{" "}
              <kbd className="rounded border px-1">Enter</kbd> para enviar
            </>
          ) : (
            <>
              <kbd className="rounded border px-1">Enter</kbd> para enviar ·{" "}
              <kbd className="rounded border px-1">/</kbd> para comandos
            </>
          )}
        </p>
      </div>
    </div>
  );
}
