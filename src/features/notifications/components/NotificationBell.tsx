import { useState } from "react";
import { ArrowRight, Bell, CheckCheck, MailOpen } from "lucide-react";

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useRecentNotifications,
  useUnreadCount,
} from "@/shared/api/hooks/notifications";
import { withQuery } from "@/shared/api/query";
import type { AppNotification } from "@/shared/api/types";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

import { notificationLink, timeAgo } from "../notification-view";

const PAGE_NAMES: Record<string, string> = {
  "/": "Inicio",
  "/calendario": "Calendario",
  "/costos-fijos": "Costos fijos",
  "/plataformas": "Plataformas",
  "/tarjetas": "Tarjetas",
  "/dia-a-dia": "Día a día",
  "/deudas": "Préstamos y deudas",
  "/categorias": "Categorías",
  "/recurrentes": "Recurrentes",
  "/estados-de-cuenta": "Estados de cuenta",
};

const SHOWN = 8;

// Bell of the header (P20, D86): unread count every minute and the latest notices. Pressing one marks it read and
// shows it whole, without leaving the page; "Ir a …" only when it belongs to another page
function NotificationBellView({ currentPath = "/" }: { currentPath?: string }) {
  const unread = useUnreadCount().data ?? 0;
  const recent = useRecentNotifications().data ?? [];
  const markRead = useMarkNotificationRead();
  const markUnread = useMarkNotificationUnread();
  const markAllRead = useMarkAllNotificationsRead();

  const [expanded, setExpanded] = useState<string | null>(null);

  // Opening a notice reads it; closing it leaves it as it is (it may have been marked unread again)
  const toggle = (notification: AppNotification) => {
    const opening = expanded !== notification.id;
    if (opening && !notification.readAt) markRead.mutate(notification.id);
    setExpanded(opening ? notification.id : null);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notificaciones: ${unread} sin leer`}>
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unread > 0 && (
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-normal text-primary hover:underline"
              onClick={(event) => {
                event.preventDefault();
                markAllRead.mutate();
              }}
            >
              <CheckCheck className="h-3.5 w-3.5" /> Marcar todas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recent.length === 0 && <p className="px-2 py-6 text-center text-sm text-muted-foreground">Sin notificaciones</p>}
        {recent.slice(0, SHOWN).map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className="flex cursor-pointer items-start gap-2 py-2"
            // Keep the menu open: the notice unfolds in place
            onSelect={(event) => {
              event.preventDefault();
              toggle(notification);
            }}
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.readAt ? "bg-transparent" : "bg-primary"}`}
              aria-label={notification.readAt ? undefined : "Sin leer"}
            />
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm ${notification.readAt ? "" : "font-semibold"}`}>{notification.title}</p>
              <p
                className={`text-xs text-muted-foreground ${expanded === notification.id ? "whitespace-pre-line" : "line-clamp-2"}`}
              >
                {notification.body}
              </p>
              <p className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                {timeAgo(notification.createdAt)}
                {expanded === notification.id && notification.readAt && (
                  <button
                    type="button"
                    className="flex items-center gap-0.5 hover:text-foreground hover:underline"
                    onClick={(event) => {
                      event.stopPropagation();
                      markUnread.mutate(notification.id);
                    }}
                  >
                    <MailOpen className="h-3 w-3" /> No leída
                  </button>
                )}
                {expanded === notification.id && notificationLink(notification) !== currentPath && (
                  <a
                    href={notificationLink(notification)}
                    className="flex items-center gap-0.5 text-primary hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Ir a {PAGE_NAMES[notificationLink(notification)] ?? "la página"} <ArrowRight className="h-3 w-3" />
                  </a>
                )}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/notificaciones" className="justify-center text-sm text-primary">
            Ver todas
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const NotificationBell = withQuery(NotificationBellView);
