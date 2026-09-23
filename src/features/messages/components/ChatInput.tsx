import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, ImagePlus, Mic, Square, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/ui/button";

// Voice notes longer than this are rejected by the bot (MAX_AUDIO_SECONDS in kogane-api)
const MAX_AUDIO_SECONDS = 60;

export interface ChatInputValue {
  text: string;
  file?: File;
  attachment?: "image" | "audio";
  durationSeconds?: number;
}

interface ChatInputProps {
  onSend: (value: ChatInputValue) => void;
  disabled: boolean;
}

// Text, an image with an optional caption, or a voice note (layout of lp-clemente-restaurante, D49)
export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const startedAtRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => recorderRef.current?.stream.getTracks().forEach((track) => track.stop()), []);

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
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const durationSeconds = (Date.now() - startedAtRef.current) / 1000;
        const type = recorder.mimeType.split(";")[0] || "audio/webm";
        const file = new File(chunks, `nota-${Date.now()}.webm`, { type });
        onSend({ text: "", file, attachment: "audio", durationSeconds });
      };
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start();
      setRecording(true);
      // the bot does not read longer notes: stop at the limit
      setTimeout(() => recorder.state === "recording" && stopRecording(), MAX_AUDIO_SECONDS * 1000);
    } catch {
      toast.error("No pude usar el micrófono.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  return (
    <div className="border-t p-3">
      {image && (
        <div className="mx-auto mb-2 flex max-w-3xl items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs">
          <ImagePlus className="h-3.5 w-3.5" />
          <span className="flex-1 truncate">{image.name}</span>
          <button type="button" onClick={() => setImage(null)} aria-label="Quitar imagen">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div className="mx-auto flex max-w-3xl items-end gap-2">
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
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || recording}
          aria-label="Adjuntar captura"
        >
          <ImagePlus className="h-5 w-5" />
        </Button>
        <textarea
          ref={textRef}
          rows={1}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={image ? "Añade un texto opcional (ej: persona dany)..." : "Ej: almuerzo 25 soles con yape"}
          disabled={disabled || recording}
          className="max-h-32 min-h-9 flex-1 resize-none rounded-2xl border bg-muted/30 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {text.trim() || image ? (
          <Button size="icon" className="h-9 w-9 shrink-0 rounded-full" onClick={send} disabled={disabled} aria-label="Enviar">
            <ArrowUp className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            variant={recording ? "destructive" : "secondary"}
            className="h-9 w-9 shrink-0 rounded-full"
            onClick={recording ? stopRecording : startRecording}
            disabled={disabled}
            aria-label={recording ? "Detener y enviar" : "Grabar nota de voz"}
          >
            {recording ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
          </Button>
        )}
      </div>
    </div>
  );
}
