import { File, FileArchive, FileAudio, FileImage, FileSpreadsheet, FileText, FileVideo, type LucideIcon } from "lucide-react";

export function getFileIcon(contentType = "", name = ""): LucideIcon {
  const mime = contentType.toLowerCase().split(";")[0].trim();
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  if (mime.startsWith("image/") || /^(png|jpe?g|gif|webp|svg|avif|heic)$/.test(extension)) return FileImage;
  if (mime.startsWith("audio/") || /^(mp3|wav|ogg|m4a|flac)$/.test(extension)) return FileAudio;
  if (mime.startsWith("video/") || /^(mp4|webm|mov)$/.test(extension)) return FileVideo;
  if (mime.includes("spreadsheet") || mime.includes("excel") || /^(xlsx?|csv|ods)$/.test(extension)) return FileSpreadsheet;
  if (mime.includes("zip") || mime.includes("compressed") || /^(zip|rar|7z|tar|gz)$/.test(extension)) return FileArchive;
  if (mime === "application/pdf" || mime.startsWith("text/") || mime.includes("word") || /^(pdf|docx?|txt|rtf|odt)$/.test(extension)) return FileText;
  return File;
}
