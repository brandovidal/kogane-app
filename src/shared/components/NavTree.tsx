import { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  Coffee,
  CreditCard,
  HandCoins,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  PieChart,
  PlusCircle,
  Receipt,
  Repeat,
  ScanText,
  Settings,
  Tags,
  Tv,
} from "lucide-react";
import { useCreditCards } from "@/shared/api/hooks/catalogs";
import { useDraftCount } from "@/shared/api/hooks/drafts";
import { NAV, SETTINGS_NAV, isActivePath, isGroup, type NavIcon, type NavLink } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";

export const NAV_ICONS: Record<NavIcon, React.ComponentType<{ className?: string }>> = {
  "message-circle": MessageCircle,
  "scan-text": ScanText,
  inbox: Inbox,
  "layout-dashboard": LayoutDashboard,
  "plus-circle": PlusCircle,
  receipt: Receipt,
  coffee: Coffee,
  tv: Tv,
  "credit-card": CreditCard,
  repeat: Repeat,
  "hand-coins": HandCoins,
  "pie-chart": PieChart,
  tags: Tags,
  "bar-chart-3": BarChart3,
  settings: Settings,
};

const OPEN_GROUPS_KEY = "kogane:nav-open";

// Credit cards as links under Tarjetas (/tarjetas/IO…)
export function useCardLinks() {
  const cards = useCreditCards().data ?? [];
  return cards.map((card) => ({ href: `/tarjetas/${card.code ?? card.id}`, label: card.name }));
}

const linkClass = (active: boolean) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );

interface NavTreeProps {
  currentPath: string;
  compact?: boolean; // icons only (D41)
}

// The menu of D41: groups open and close (remembered in this browser); the group of the current page starts open
export function NavTree({ currentPath, compact = false }: NavTreeProps) {
  const cards = useCardLinks();
  const draftCount = useDraftCount().data ?? 0;
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    let saved: string[] = [];
    try {
      saved = JSON.parse(localStorage.getItem(OPEN_GROUPS_KEY) ?? "[]");
    } catch {
      // ignore
    }
    const current = NAV.filter(isGroup)
      .filter((group) => group.children.some((child) => isActivePath(child.href, currentPath)))
      .map((group) => group.label);
    setOpenGroups([...new Set([...saved, ...current])]);
  }, [currentPath]);

  const toggle = (label: string) =>
    setOpenGroups((current) => {
      const next = current.includes(label) ? current.filter((item) => item !== label) : [...current, label];
      try {
        localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

  const renderLink = (link: NavLink) => {
    const Icon = NAV_ICONS[link.icon];
    const badge = link.badge === "drafts" && draftCount > 0 ? draftCount : null;
    return (
      <a
        key={link.href}
        href={link.href}
        title={compact ? link.label : undefined}
        className={cn(linkClass(isActivePath(link.href, currentPath)), compact && "justify-center px-2")}
      >
        <span className="relative">
          <Icon className="h-4 w-4" />
          {compact && badge && <span className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full bg-primary" />}
        </span>
        {!compact && <span className="flex-1">{link.label}</span>}
        {!compact && badge && (
          <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">{badge}</span>
        )}
      </a>
    );
  };

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {NAV.map((entry, index) => {
        if (!isGroup(entry)) {
          return (
            <div key={entry.href}>
              {renderLink(entry)}
              {/* Mensajes · Reconocimiento · Borrador first, then the rest (D49) */}
              {index === 2 && <div className="my-2 border-t border-sidebar-border" />}
            </div>
          );
        }

        const Icon = NAV_ICONS[entry.icon];
        const open = openGroups.includes(entry.label) || compact;
        return (
          <div key={entry.label}>
            {!compact && (
              <button type="button" onClick={() => toggle(entry.label)} className={cn(linkClass(false), "w-full")}>
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{entry.label}</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
              </button>
            )}
            {open && (
              <div className={cn("space-y-1", !compact && "ml-4 border-l border-sidebar-border pl-2")}>
                {entry.children.map((child) => (
                  <div key={child.href}>
                    {renderLink(child)}
                    {!compact && child.cards && cards.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {cards.map((card) => (
                          <a key={card.href} href={card.href} className={cn(linkClass(currentPath === card.href), "py-1.5 text-xs")}>
                            {card.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div className="mt-2 border-t border-sidebar-border pt-2">{renderLink(SETTINGS_NAV)}</div>
    </nav>
  );
}
