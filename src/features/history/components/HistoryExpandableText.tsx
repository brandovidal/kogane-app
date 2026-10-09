import { useState } from "react";
import { isLongValue, truncateValue } from "../lib/history-view";

// Texto largo del historial (notas): corta con «Ver completo» / «Ver menos»
export function HistoryExpandableText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  if (!isLongValue(text))
    return <span className="whitespace-pre-wrap wrap-anywhere">{text}</span>;
  return (
    <span className="min-w-0">
      <span className="whitespace-pre-wrap wrap-anywhere">
        {open ? text : truncateValue(text)}
      </span>{" "}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="text-xs text-primary underline-offset-2 hover:underline"
      >
        {open ? "Ver menos" : "Ver completo"}
      </button>
    </span>
  );
}
