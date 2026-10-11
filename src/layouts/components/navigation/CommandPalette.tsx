import { useEffect, useMemo, useState } from "react";
import { useCreditCards } from "@/shared/api/hooks/catalogs";
import { withQuery } from "@/shared/api/query";
import { cardHref } from "@/features/credit-cards/lib/card-links";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/ui/dialog";
import { NAV, OPEN_SEARCH_EVENT } from "@/shared/constants/navigation";
import { flattenNav } from "@/shared/utils/navigation";
import { type FlatLink } from "@/shared/types/navigation";
import { newExpenseStore } from "@/features/new-expense/stores/new-expense.store";
import { normalize } from "@/shared/lib/text";
import { periodStore } from "@/shared/stores/period.store";
import { getCurrentMonth, getCurrentYear } from "@/shared/lib/dates";

const RECENT_KEY = "kogane:recent-links";
const MAX_RECENT = 4;

type PaletteItem = FlatLink & { section?: string; run?: () => void };

const readRecent = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(RECENT_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

const rememberLink = (href: string) => {
  try {
    const next = [href, ...readRecent().filter((item) => item !== href)];
    localStorage.setItem(RECENT_KEY, JSON.stringify(next.slice(0, MAX_RECENT)));
  } catch {
    // not remembered
  }
};

// "Ir a hoy": the month on screen goes back to the current one
const GO_TO_TODAY: PaletteItem = {
  href: "#hoy",
  label: "Ir a hoy",
  group: "Período",
  run: () =>
    periodStore.getState().setPeriod(getCurrentMonth(), getCurrentYear()),
};

// Ctrl+K (or ⌘K): jump to any screen or card by typing part of its name (D41)
function CommandPaletteView() {
  const cards = (useCreditCards().data ?? []).map((card) => ({
    href: cardHref(card.code ?? card.id),
    label: card.name,
  }));
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
    // the search button of the menu asks for the palette without knowing about it
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, []);

  // Read when it opens: the palette stays mounted between uses
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);

  const results = useMemo<PaletteItem[]>(() => {
    const links = flattenNav(NAV, cards);
    const term = normalize(query);
    if (term)
      return [...links, GO_TO_TODAY].filter((link) =>
        normalize(`${link.group ?? ""} ${link.label}`).includes(term),
      );
    // Without a search: what was opened lately, the actions, then every screen
    const recents = recent
      .map((href) => links.find((link) => link.href === href))
      .filter((link): link is FlatLink => Boolean(link && !link.action));
    const actions = [...links.filter((link) => link.action), GO_TO_TODAY];
    const rest = links.filter(
      (link) => !link.action && !recents.includes(link),
    );
    return [
      ...recents.map((link) => ({ ...link, section: "Recientes" })),
      ...actions.map((link) => ({ ...link, section: "Acciones" })),
      ...rest.map((link) => ({ ...link, section: "Ir a" })),
    ];
  }, [cards, query, recent]);

  useEffect(() => setSelected(0), [query, open]);

  // Ctrl/⌘ + ↵ (or Ctrl/⌘ + click) opens the screen in a new tab (board HdrBusqueda)
  const go = (link: PaletteItem, newTab = false) => {
    setOpen(false);
    if (link.run) link.run();
    else if (link.action === "new-expense")
      newExpenseStore.getState().openWith();
    else {
      rememberLink(link.href);
      if (newTab) window.open(link.href, "_blank", "noopener");
      else window.location.href = link.href;
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        setQuery("");
      }}
    >
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogTitle className="sr-only">Ir a</DialogTitle>
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown")
                setSelected((current) =>
                  Math.min(current + 1, results.length - 1),
                );
              if (event.key === "ArrowUp")
                setSelected((current) => Math.max(current - 1, 0));
              if (event.key === "Enter" && results[selected])
                go(results[selected], event.ctrlKey || event.metaKey);
            }}
            placeholder="Buscar o ir a… (ej: borrador, io, deudas)"
            className="h-11 flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            Esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-1">
          {results.map((link, index) => (
            <li key={`${link.section ?? ""}:${link.href}`}>
              {link.section && link.section !== results[index - 1]?.section && (
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {link.section}
                </p>
              )}
              <button
                type="button"
                onMouseEnter={() => setSelected(index)}
                onClick={(event) => go(link, event.ctrlKey || event.metaKey)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${index === selected ? "bg-muted" : ""}`}
              >
                <span>{link.label}</span>
                {link.group && (
                  <span className="text-xs text-muted-foreground">
                    {link.group}
                  </span>
                )}
              </button>
            </li>
          ))}
          {!results.length && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              Sin resultados
            </li>
          )}
        </ul>
        <div className="hidden items-center gap-4 border-t px-3 py-2 text-[11px] text-muted-foreground sm:flex">
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>Ctrl ↵ abrir en pestaña nueva</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const CommandPalette = withQuery(CommandPaletteView);
