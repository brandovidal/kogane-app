import { Paperclip } from "lucide-react";
import type { AttachmentRefType } from "@/shared/api/types";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { AttachmentsPanel } from "../AttachmentsPanel";

// The same panel in a dialog, for the ⋯ of an expense row
export function AttachmentsDialog({
  title,
  refType,
  refId,
  onClose,
}: {
  title: string;
  refType: AttachmentRefType;
  refId: string;
  onClose: () => void;
}) {
  return (
    <ResponsiveDialog open onOpenChange={(open) => !open && onClose()} title={`Archivos de ${title}`} icon={<Paperclip aria-hidden="true" className="size-4 text-primary" />} description="Boleta, recibo o contrato de este registro.">
      <AttachmentsPanel refType={refType} refId={refId} />
    </ResponsiveDialog>
  );
}
