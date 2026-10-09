import { useRef, useState, type DragEvent } from "react";
import { FileUp, Upload } from "lucide-react";
import { Button } from "@/ui/button";
import { cn } from "@/shared/utils/cn";
import type { ImportSource } from "../types/import-types";
import { acceptAttr } from "../lib/upload-flow";

const COPY: Record<
  ImportSource,
  { title: string; hint: string; drop: string }
> = {
  statement: {
    title: "Arrastra el estado de cuenta",
    hint: "o elige un archivo de tu equipo",
    drop: "Estado de cuenta · PDF",
  },
  notion: {
    title: "Arrastra el export de Notion",
    hint: "El ZIP o los CSV «*_all.csv» de Seguimiento financiero",
    drop: "Notion · ZIP o CSV",
  },
};

// Zona de carga (boards I1 inicio · I2 arrastrando)
export function ImportDropzone({
  source,
  onFiles,
}: {
  source: ImportSource;
  onFiles: (files: File[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const copy = COPY[source];

  const drop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length) onFiles(source === "notion" ? files : files.slice(0, 1));
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={drop}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors",
        dragging ? "border-primary bg-primary/5" : "bg-muted/20",
      )}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-xl",
          dragging ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        <Upload aria-hidden="true" className="size-5" />
      </span>
      {dragging ? (
        <>
          <b>Suelta para subir</b>
          <p className="text-xs text-muted-foreground">{copy.drop}</p>
        </>
      ) : (
        <>
          <b>{copy.title}</b>
          <p className="text-xs text-muted-foreground">{copy.hint}</p>
          <Button variant="outline" onClick={() => input.current?.click()}>
            <FileUp className="size-4" /> Elegir archivo
          </Button>
        </>
      )}
      <input
        ref={input}
        key={source}
        type="file"
        hidden
        multiple={source === "notion"}
        accept={acceptAttr(source)}
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
    </div>
  );
}
