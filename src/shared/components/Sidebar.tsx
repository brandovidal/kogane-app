import { useEffect, useState } from "react";
import { Coins, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/ui/button";
import { withQuery } from "@/shared/api/query";
import { cn } from "@/shared/lib/utils";
import { CommandPalette } from "./CommandPalette";
import { NavTree } from "./NavTree";

const COMPACT_KEY = "kogane:sidebar-compact";

interface SidebarProps {
  currentPath: string;
}

// Desktop menu (D41): brand Kogane, compact mode with icons only (remembered in this browser) and Ctrl+K
function SidebarView({ currentPath }: SidebarProps) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    try {
      setCompact(localStorage.getItem(COMPACT_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  const toggle = () =>
    setCompact((current) => {
      try {
        localStorage.setItem(COMPACT_KEY, current ? "0" : "1");
      } catch {
        // ignore
      }
      return !current;
    });

  return (
    <aside className={cn("hidden md:flex md:flex-col border-r border-sidebar-border bg-sidebar transition-[width]", compact ? "md:w-16" : "md:w-64")}>
      <div className={cn("flex h-16 items-center border-b border-sidebar-border", compact ? "justify-center" : "justify-between px-4")}>
        {!compact && (
          <a href="/" className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-sidebar-primary" />
            <span className="text-lg font-bold text-sidebar-foreground">Kogane</span>
          </a>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggle} title={compact ? "Expandir menú" : "Compactar menú"}>
          {compact ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      <NavTree currentPath={currentPath} compact={compact} />
      {!compact && (
        <p className="border-t border-sidebar-border px-4 py-2 text-xs text-sidebar-foreground/60">
          <kbd className="rounded border px-1">Ctrl</kbd> + <kbd className="rounded border px-1">K</kbd> para buscar
        </p>
      )}
      <CommandPalette />
    </aside>
  );
}

export const Sidebar = withQuery(SidebarView);
