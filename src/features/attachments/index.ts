// Public module API. Internal files import concrete modules to avoid cycles.
export { AttachmentRecordThumbnail } from "./components/AttachmentRecordThumbnail";
export {
  AttachmentGallery,
  type AttachmentGalleryProps,
} from "./components/AttachmentGallery";
export type { AttachmentRecordThumbnailProps } from "./components/AttachmentRecordThumbnail";
export { AttachmentPreviewMedia } from "./components/AttachmentPreviewMedia";
export type {
  AttachmentPreview,
  AttachmentPreviewDialogProps,
} from "./types/attachment-preview";
export type { AttachmentsPanelProps } from "./components/AttachmentsPanel";
export { AttachmentsPanel } from "./components/AttachmentsPanel";
export { AttachmentFileCard } from "./components/AttachmentFileCard";
export type { AttachmentFileCardProps } from "./components/AttachmentFileCard";
export { formatAttachmentSize } from "./lib/attachment-size";
export { AttachmentPreviewDialog } from "./components/dialogs/AttachmentPreviewDialog";
export { AttachmentsDialog } from "./components/dialogs/AttachmentsDialog";
export {
  ATTACHMENT_KIND_LABELS,
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_MB,
} from "./constants/attachments";
export { attachmentKeys } from "./constants/query-keys";
export {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from "./hooks/attachments";
export type {
  AttachmentUpload,
  AttachmentQueryOptions,
} from "./hooks/attachments";
export { useAttachmentThumbnail } from "./hooks/useAttachmentThumbnail";
