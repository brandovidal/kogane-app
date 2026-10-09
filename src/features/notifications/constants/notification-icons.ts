import {
  AlertTriangle,
  CalendarClock,
  Check,
  CreditCard,
  HandCoins,
  PieChart,
  Repeat,
  ScanSearch,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { NotificationKind } from "@/shared/api/types";

// One icon per kind: the list is scanned by shape before it is read
export const NOTIFICATION_KIND_ICONS: Record<NotificationKind, LucideIcon> = {
  due: AlertTriangle,
  card_close: CreditCard,
  daily_close: CalendarClock,
  weekly: Sparkles,
  budget: PieChart,
  anomaly: ScanSearch,
  recurring: Repeat,
  statement: Check,
  collect: HandCoins,
};
