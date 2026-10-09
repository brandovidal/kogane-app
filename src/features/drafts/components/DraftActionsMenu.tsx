import {
  Check,
  ImageIcon,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Pencil,
  RotateCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import type { DraftTab } from "@/features/drafts/hooks/drafts";
import {
  draftMediaKind,
  useOpenDraftMedia,
} from "@/features/drafts/hooks/draft-media";

interface MenuDraft {
  id: string;
  inputType: string;
  missingFields: string[];
}

// ··· de cada fila (board B7): las acciones cambian según la pestaña y si el borrador está completo
export function DraftActionsMenu({
  draft,
  tab,
  label,
  onSave,
  onRetry,
  onEdit,
  onDiscard,
}: {
  draft: MenuDraft;
  tab: DraftTab;
  label: string;
  onSave: () => void;
  onRetry: () => void;
  onEdit: () => void;
  onDiscard: () => void;
}) {
  const openMedia = useOpenDraftMedia();
  const mediaKind = draftMediaKind(draft.inputType);
  const incomplete = draft.missingFields.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`Acciones de ${label}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {tab === "failed" ? (
          <>
            <DropdownMenuItem
              onSelect={onRetry}
              className="font-medium text-primary"
            >
              <RotateCw /> Reintentar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onEdit}>
              <MessageSquare /> Escribir manual
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onSelect={onSave}
              disabled={tab !== "discarded" && incomplete}
              className={
                tab !== "discarded" && !incomplete
                  ? "font-medium text-primary"
                  : undefined
              }
            >
              <Check /> Guardar
              {tab === "discarded" ? (
                <span className="ml-auto text-xs text-muted-foreground">
                  Lo restaura
                </span>
              ) : (
                incomplete && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Falta info
                  </span>
                )
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil />{" "}
              {tab === "review" && incomplete ? "Completar" : "Editar"}
            </DropdownMenuItem>
          </>
        )}
        {mediaKind && (
          <DropdownMenuItem onSelect={() => void openMedia(draft.id)}>
            {mediaKind === "audio" ? <Mic /> : <ImageIcon />}
            {mediaKind === "audio" ? "Escuchar nota de voz" : "Ver captura"}
          </DropdownMenuItem>
        )}
        {tab !== "discarded" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDiscard}>
              <Trash2 /> Descartar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
