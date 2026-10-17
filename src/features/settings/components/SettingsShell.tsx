import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/shared/utils/cn";
import { SETTINGS_NAV_GROUPS, settingsHref, type SettingsSection } from "../constants/sections";

const STORAGE_KEY = "kogane:settings-nav";

interface NavState {
  rail: boolean;
  folded: string[];
}

function readState(): NavState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { rail: false, folded: [], ...JSON.parse(raw) };
  } catch {
    /* storage unavailable: defaults */
  }
  return { rail: false, folded: [] };
}

// Submenu of Configuración: groups fold, the whole menu collapses to an icon rail. Each item is its own route.
export function SettingsShell({
  section,
  isAdmin,
  wide = false,
  children,
}: {
  section: SettingsSection;
  isAdmin: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  const [state, setState] = useState<NavState>({ rail: false, folded: [] });
  useEffect(() => setState(readState()), []);
  const update = (next: NavState) => {
    setState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <nav aria-label="Configuración" className={cn("shrink-0", state.rail ? "md:w-12" : "md:w-56")}>
        <button
          type="button"
          className="mb-2 hidden items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted md:flex"
          aria-label={state.rail ? "Expandir menú" : "Contraer menú"}
          onClick={() => update({ ...state, rail: !state.rail })}
        >
          {state.rail ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" /> Contraer
            </>
          )}
        </button>
        <div className="flex gap-3 overflow-x-auto md:block md:space-y-3 md:overflow-visible">
          {SETTINGS_NAV_GROUPS.map((group) => {
            const items = group.items.filter((i) => !i.adminOnly || isAdmin);
            if (items.length === 0) return null;
            const folded = !state.rail && state.folded.includes(group.label);
            return (
              <div key={group.label} className="flex gap-1 md:block">
                {!state.rail && (
                  <button
                    type="button"
                    aria-expanded={!folded}
                    className="hidden w-full items-center justify-between px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground md:flex"
                    onClick={() =>
                      update({
                        ...state,
                        folded: folded ? state.folded.filter((l) => l !== group.label) : [...state.folded, group.label],
                      })
                    }
                  >
                    {group.label}
                    <ChevronDown className={cn("h-3 w-3 transition", folded && "-rotate-90")} />
                  </button>
                )}
                {!folded &&
                  items.map(({ key, label, icon: Icon }) => (
                    <a
                      key={key}
                      href={settingsHref(key)}
                      title={label}
                      aria-current={key === section ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                        key === section && "bg-muted font-medium",
                        state.rail && "md:justify-center",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className={cn(state.rail && "md:sr-only")}>{label}</span>
                    </a>
                  ))}
              </div>
            );
          })}
        </div>
      </nav>
      <div className={`min-w-0 flex-1 ${wide ? "w-full" : "max-w-4xl"}`}>{children}</div>
    </div>
  );
}
