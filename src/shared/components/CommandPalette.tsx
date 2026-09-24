import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";
import { NAV, flattenNav, type FlatLink } from "@/shared/constants";
import { newExpenseStore } from "@/shared/stores/new-expense.store";
import { normalize } from "@/shared/lib/text";
import { useCardLinks } from "./NavTree";

// Ctrl+K (or ⌘K): jump to any screen or card by typing part of its name (D41)
export function CommandPalette() {
  const cards = useCardLinks();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const links = flattenNav(NAV, cards);
    const term = normalize(query);
    return term ? links.filter((link) => normalize(`${link.group ?? ""} ${link.label}`).includes(term)) : links;
  }, [cards, query]);

  useEffect(() => setSelected(0), [query, open]);

  const go = (link: FlatLink) => {
    setOpen(false);
    if (link.action === "new-expense") newExpenseStore.getState().openWith();
    else window.location.href = link.href;
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); setQuery(""); }}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogTitle className="sr-only">Ir a</DialogTitle>
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") setSelected((current) => Math.min(current + 1, results.length - 1));
              if (event.key === "ArrowUp") setSelected((current) => Math.max(current - 1, 0));
              if (event.key === "Enter" && results[selected]) go(results[selected]);
            }}
            placeholder="Ir a… (ej: borrador, io, deudas)"
            className="h-11 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-1">
          {results.map((link, index) => (
            <li key={link.href}>
              <button
                type="button"
                onMouseEnter={() => setSelected(index)}
                onClick={() => go(link)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${index === selected ? "bg-muted" : ""}`}
              >
                <span>{link.label}</span>
                {link.group && <span className="text-xs text-muted-foreground">{link.group}</span>}
              </button>
            </li>
          ))}
          {!results.length && <li className="px-3 py-6 text-center text-sm text-muted-foreground">Sin resultados</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
