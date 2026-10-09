import type {
  NavEntry,
  NavGroup,
  Card,
  FlatLink,
} from "@/shared/types/navigation";
import {
  NOTIFICATIONS_LINK,
  SETTINGS_NAV,
} from "@/shared/constants/navigation";

export const isGroup = (entry: NavEntry): entry is NavGroup =>
  "children" in entry;

export function flattenNav(nav: NavEntry[], cards: Card[] = []): FlatLink[] {
  const links: FlatLink[] = [];
  for (const entry of nav) {
    if (!isGroup(entry)) {
      links.push({ href: entry.href, label: entry.label });
      continue;
    }
    for (const child of entry.children) {
      links.push({
        href: child.href,
        label: child.label,
        group: entry.label,
        action: child.action,
      });
      if (child.cards)
        cards.forEach((card) => links.push({ ...card, group: entry.label }));
    }
  }
  return [
    ...links,
    NOTIFICATIONS_LINK,
    { href: SETTINGS_NAV.href, label: SETTINGS_NAV.label },
  ];
}

// A static page is served with or without a trailing slash (/cobros, /cobros/): both are the same page (D102)
export const isActivePath = (href: string, currentPath: string) => {
  const path =
    currentPath.length > 1 ? currentPath.replace(/\/+$/, "") : currentPath;
  return href === "/"
    ? path === "/"
    : path === href || path.startsWith(`${href}/`);
};
