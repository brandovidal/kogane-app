import { useDraftCount } from "@/shared/api/hooks/drafts";
import { withQuery } from "@/shared/api/query";

// The only live piece of the menu: how many drafts wait for review (D41). A pill next to the link; `dot` is the small
// mark on the icon that the compact menu shows instead (its CSS hides the other)
function DraftCountView({ dot = false }: { dot?: boolean }) {
  const count = useDraftCount().data ?? 0;
  if (!count) return null;
  if (dot) {
    return <span className="absolute -right-1.5 -top-1.5 hidden h-2 w-2 rounded-full bg-primary group-data-[compact=true]/sb:block" />;
  }
  return <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">{count}</span>;
}

export const DraftCount = withQuery(DraftCountView);
