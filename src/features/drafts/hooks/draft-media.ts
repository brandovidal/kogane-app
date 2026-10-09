import { toast } from "sonner";
import { getDraft } from "@/features/drafts/services/draft.service";
import { errorMessage } from "@/shared/api/hooks/use-api-mutation";

export type DraftMediaKind = "image" | "audio";

export const draftMediaKind = (inputType: string): DraftMediaKind | null =>
  inputType === "audio" ? "audio" : inputType === "image" ? "image" : null;

// The screenshot or voice note lives in R2 (D58): a 10 minute link is asked for only when opened
export function useOpenDraftMedia() {
  return async (draftId: string) => {
    try {
      const draft = await getDraft(draftId);
      if (draft.mediaUrl) window.open(draft.mediaUrl, "_blank", "noopener");
      else toast.info("El archivo ya expiró (7 días) o no se guardó.");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
}
