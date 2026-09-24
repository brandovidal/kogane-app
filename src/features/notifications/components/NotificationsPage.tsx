import { useState } from "react";
import { CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationHistory,
} from "@/shared/api/hooks/notifications";
import { withQuery } from "@/shared/api/query";
import type { NotificationKind } from "@/shared/api/types";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatCurrency } from "@/shared/lib/currency";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";

import { NOTIFICATION_KIND_LABELS, NOTIFICATION_KINDS, notificationLink, timeAgo } from "../notification-view";

const PAGE_SIZE = 20;
const ALL = "__all__";

// Notificaciones (P20, D86): every notice sent, by kind, read or not; the channels are set in Configuración
function NotificationsPageView() {
  const [kind, setKind] = useState<NotificationKind | undefined>();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const { data, isLoading } = useNotificationHistory({
    kind,
    unread: unreadOnly ? "true" : undefined,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={kind ?? ALL}
          onValueChange={(value) => {
            setKind(value === ALL ? undefined : (value as NotificationKind));
            setPage(0);
          }}
        >
          <SelectTrigger className="h-9 w-[230px]" aria-label="Tipo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los tipos</SelectItem>
            {NOTIFICATION_KINDS.map((value) => (
              <SelectItem key={value} value={value}>
                {NOTIFICATION_KIND_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={unreadOnly}
            onCheckedChange={(value) => {
              setUnreadOnly(value);
              setPage(0);
            }}
          />
          Solo sin leer
        </label>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => markAllRead.mutate()}>
          <CheckCheck className="mr-1 h-3.5 w-3.5" /> Marcar todas como leídas
        </Button>
      </div>

      {!isLoading && items.length === 0 && <EmptyState title="Sin notificaciones" description="Aquí llegan los avisos del calendario, el presupuesto y los cargos raros." />}

      <div className="space-y-2">
        {items.map((notification) => (
          <Card key={notification.id} className={notification.readAt ? "opacity-80" : "border-primary/40"}>
            <CardContent className="flex items-start gap-3 py-3">
              <span
                className={`mt-2 h-2 w-2 shrink-0 rounded-full ${notification.readAt ? "bg-transparent" : "bg-primary"}`}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={notificationLink(notification)}
                    className={`text-sm hover:underline ${notification.readAt ? "" : "font-semibold"}`}
                    onClick={() => !notification.readAt && markRead.mutate(notification.id)}
                  >
                    {notification.title}
                  </a>
                  <Badge variant="outline" className="text-[11px]">
                    {NOTIFICATION_KIND_LABELS[notification.kind]}
                  </Badge>
                  {notification.telegramSentAt && (
                    <Badge variant="secondary" className="text-[11px]">
                      Telegram
                    </Badge>
                  )}
                </div>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{notification.body}</p>
                <p className="text-xs text-muted-foreground">
                  {timeAgo(notification.createdAt)}
                  {notification.amount != null && ` · ${formatCurrency(notification.amount)}`}
                </p>
              </div>
              {!notification.readAt && (
                <Button variant="ghost" size="sm" onClick={() => markRead.mutate(notification.id)}>
                  Leída
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            {page + 1} de {pages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page + 1 >= pages}
            onClick={() => setPage(page + 1)}
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export const NotificationsPage = withQuery(NotificationsPageView);
