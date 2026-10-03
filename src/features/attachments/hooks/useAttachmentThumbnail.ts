import { useEffect, useRef, useState } from "react";
import type { AttachmentRefType } from "@/shared/api/types";
import { useAttachments } from "./attachments";

// Load attachment metadata only for rows approaching the viewport; share the
// panel's query cache and refresh signed URLs when stale or invalidated.
export function useAttachmentThumbnail(refType: AttachmentRefType, refId: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "160px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  const query = useAttachments(refType, refId, { enabled: visible, staleTime: 60_000 });
  return { ref, visible, ...query };
}
