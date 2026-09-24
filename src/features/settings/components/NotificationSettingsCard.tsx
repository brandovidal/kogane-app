import { Bell } from "lucide-react";

import { useNotificationSettings, useUpdateNotificationSettings } from "@/shared/api/hooks/notifications";
import type { NotificationKind } from "@/shared/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

import { NOTIFICATION_KIND_LABELS, NOTIFICATION_KINDS } from "@/features/notifications/notification-view";

type Channel = "telegram" | "web";

// Configuración ▸ Notificaciones (P20, D86): each kind of notice to Telegram and/or the web bell (/avisos in the bot)
export function NotificationSettingsCard() {
  const settings = useNotificationSettings().data;
  const update = useUpdateNotificationSettings();

  const toggle = (kind: NotificationKind, channel: Channel, value: boolean) =>
    update.mutate({ [kind]: { [channel]: value } });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" />
          Notificaciones
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Qué avisos llegan al bot de Telegram y a la campana de la web. En el bot también con /avisos.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aviso</TableHead>
              <TableHead className="w-24 text-center">Telegram</TableHead>
              <TableHead className="w-24 text-center">Web</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {NOTIFICATION_KINDS.map((kind) => (
              <TableRow key={kind}>
                <TableCell>{NOTIFICATION_KIND_LABELS[kind]}</TableCell>
                {(["telegram", "web"] as Channel[]).map((channel) => (
                  <TableCell key={channel} className="text-center">
                    <Switch
                      checked={settings?.[kind]?.[channel] ?? false}
                      disabled={!settings || update.isPending}
                      onCheckedChange={(value) => toggle(kind, channel, value)}
                      aria-label={`${NOTIFICATION_KIND_LABELS[kind]} en ${channel === "web" ? "la web" : "Telegram"}`}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
