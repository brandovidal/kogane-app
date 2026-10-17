import { useEffect, useState } from "react";
import { useDraftCount } from "@/features/drafts/hooks/drafts";
import { withQuery } from "@/shared/api/query";

function DraftCountView({ dot = false }: { dot?: boolean }) {
  const count = useDraftCount().data ?? 0;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !count) return null;
  if (dot) {
    return <span className="absolute -right-1.5 -top-1.5 hidden h-2 w-2 rounded-full bg-primary group-data-[compact=true]/sb:block" />;
  }
  return <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">{count}</span>;
}

export const DraftCount = withQuery(DraftCountView);
