import { useState } from "react";
import { ArrowRight, Bell, MailOpen } from "lucide-react";

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useRecentNotifications,
  useUnreadCount,
} from "@/features/notifications/hooks/notifications";
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

import { NOTIFICATION_KIND_ICONS } from "@/features/notifications/constants/notification-icons";
import {
  filterByTab,
  groupByDay,
  NOTIFICATION_TABS,
  noticeTime,
  notificationLink,
  type NotificationTab,
} from "@/features/notifications/lib/notification-view";
import { cn } from "@/shared/utils/cn";

const PAGE_NAMES: Record<string, string> = {
  "/": "Inicio",
  "/calendario": "Calendario",
  "/costos-fijos": "Costos fijos",
  "/plataformas": "Plataformas",
  "/tarjetas": "Tarjetas",
  "/dia-a-dia": "Día a día",
  "/cobros": "Cobros",
  "/deudas": "Deudas",
  "/resumen-deudas": "Resumen de deudas",
  "/categorias": "Categorías",
  "/recurrentes": "Recurrentes",
  "/importacion": "Importación",
};

const SHOWN = 8;

// Bell of the header (P20, D86): unread count every minute and the latest notices, in tabs and grouped by day. Pressing
// one marks it read and shows it whole, without leaving the page; "Ir a …" only when it belongs to another page
function NotificationBellView({ currentPath = "/" }: { currentPath?: string }) {
  const unread = useUnreadCount().data ?? 0;
  const recent = useRecentNotifications().data ?? [];
  const markRead = useMarkNotificationRead();
  const markUnread = useMarkNotificationUnread();
  const markAllRead = useMarkAllNotificationsRead();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<NotificationTab>("all");

  // Opening a notice reads it; closing it leaves it as it is (it may have been marked unread again)
  const toggle = (notification: AppNotification) => {
    const opening = expanded !== notification.id;
    if (opening && !notification.readAt) markRead.mutate(notification.id);
    setExpanded(opening ? notification.id : null);
  };

  const shown = filterByTab(recent, tab).slice(0, SHOWN);
  const groups = groupByDay(shown);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notificaciones: ${unread} sin leer`}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">Notificaciones</span>
            {unread > 0 && (
              <span className="rounded-full bg-brand/20 px-2 text-xs font-medium text-brand">
                {unread}
              </span>
            )}
          </div>
          {unread > 0 && (
            <button
              type="button"
              className="text-xs text-brand hover:underline"
              onClick={() => markAllRead.mutate()}
            >
              Marcar todo como leído
            </button>
          )}
        </div>
        <div
          role="tablist"
          aria-label="Filtrar notificaciones"
          className="mx-3 mb-2 grid grid-cols-3 gap-1 rounded-lg border bg-muted/40 p-1"
        >
          {NOTIFICATION_TABS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={tab === option.value}
              className={cn(
                "h-7 rounded-md text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                tab === option.value && "bg-accent text-foreground",
              )}
              onClick={() => setTab(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="max-h-[26rem] overflow-y-auto px-1 pb-1">
          {groups.length === 0 && (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              {tab === "unread" ? "Todo al día" : "Sin notificaciones"}
            </p>
          )}
          {groups.map((group) => (
            <div key={group.label}>
              <DropdownMenuLabel className="eyebrow px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {group.label}
              </DropdownMenuLabel>
              {group.items.map((notification) => {
                const Icon = NOTIFICATION_KIND_ICONS[notification.kind] ?? Bell;
                const open = expanded === notification.id;
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex cursor-pointer items-start gap-3 px-3 py-2"
                    // Keep the menu open: the notice unfolds in place
                    onSelect={(event) => {
                      event.preventDefault();
                      toggle(notification);
                    }}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm",
                          notification.readAt
                            ? "text-foreground/80"
                            : "font-medium",
                        )}
                      >
                        {notification.title}
                      </p>
                      <p
                        className={cn(
                          "text-xs text-muted-foreground",
                          open ? "whitespace-pre-line" : "line-clamp-2",
                        )}
                      >
                        {notification.body}
                      </p>
                      {open && (
                        <p className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                          {notification.readAt ? (
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
                          ) : (
                            <span />
                          )}
                          {notificationLink(notification) !== currentPath && (
                            <a
                              href={notificationLink(notification)}
                              className="flex items-center gap-0.5 text-brand hover:underline"
                              onClick={(event) => event.stopPropagation()}
                            >
                              Ir a{" "}
                              {PAGE_NAMES[notificationLink(notification)] ??
                                "la página"}{" "}
                              <ArrowRight className="h-3 w-3" />
                            </a>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5 text-[11px] text-muted-foreground">
                      <span className="tabular-nums">
                        {noticeTime(notification.createdAt)}
                      </span>
                      {!notification.readAt && (
                        <span
                          className="size-1.5 rounded-full bg-brand"
                          aria-label="Sin leer"
                        />
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          ))}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <DropdownMenuItem asChild>
          <a
            href="/notificaciones"
            className="justify-center rounded-none py-2.5 text-sm text-brand"
          >
            Ver todas las notificaciones
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const NotificationBell = withQuery(NotificationBellView);
