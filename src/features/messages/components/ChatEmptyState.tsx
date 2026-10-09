import { ImagePlus, MessageSquare, Mic, type LucideIcon } from "lucide-react";

export type ChatStarter = "text" | "capture" | "voice";

const STARTERS: {
  id: ChatStarter;
  icon: LucideIcon;
  title: string;
  description: string;
  example: string;
}[] = [
  {
    id: "text",
    icon: MessageSquare,
    title: "Escribe",
    description: "Con lenguaje natural",
    example: "almuerzo 25 con yape",
  },
  {
    id: "capture",
    icon: ImagePlus,
    title: "Sube una captura",
    description: "Yape, Plin o voucher",
    example: "captura-yape.png",
  },
  {
    id: "voice",
    icon: Mic,
    title: "Graba una nota",
    description: "Dicta el gasto",
    example: "«taxi 12 soles»",
  },
];

// Conversación vacía (board M2): tres formas de registrar un gasto
export function ChatEmptyState({
  onPick,
  disabled,
}: {
  onPick: (starter: ChatStarter) => void;
  disabled?: boolean;
}) {
  return (
    <section
      aria-label="Empezar una conversación"
      className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center"
    >
      <span
        aria-hidden="true"
        className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-foreground text-2xl font-bold text-background"
      >
        K
      </span>
      <h2 className="text-2xl font-bold tracking-tight">¿Qué gastaste hoy?</h2>
      <p className="text-sm text-muted-foreground">
        Elige cómo registrarlo. Todo pasa por Borrador antes de guardarse.
      </p>
      <div className="mt-6 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {STARTERS.map(({ id, icon: Icon, title, description, example }) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(id)}
            className="flex flex-col items-center gap-1.5 rounded-2xl border bg-card/40 p-4 text-center transition-colors hover:bg-muted/50 disabled:opacity-50"
          >
            <span className="mb-1 flex size-10 items-center justify-center self-start rounded-xl bg-indigo-400/15 text-indigo-300">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <b className="text-sm">{title}</b>
            <span className="text-xs text-muted-foreground">{description}</span>
            <code className="mt-1 rounded-md bg-muted px-2 py-0.5 text-xs">
              {example}
            </code>
          </button>
        ))}
      </div>
    </section>
  );
}
