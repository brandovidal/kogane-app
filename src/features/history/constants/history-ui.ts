import { Bot, Clock, Globe, PackageOpen, Pencil, Plus, RotateCcw, Terminal, Trash2 } from "lucide-react";
import type { HistoryEntry } from "@/shared/api/types";

export const HISTORY_SOURCE_ICONS = {
  web: Globe,
  bot: Bot,
  import: PackageOpen,
  scheduler: Clock,
  cli: Terminal,
} satisfies Record<HistoryEntry["source"], typeof Globe>;

export const HISTORY_ACTION_STYLES = {
  create: { icon: Plus, className: "bg-primary/10 text-primary" },
  update: { icon: Pencil, className: "bg-secondary text-secondary-foreground" },
  delete: { icon: Trash2, className: "bg-destructive/10 text-destructive" },
  restore: { icon: RotateCcw, className: "bg-primary/10 text-primary" },
} satisfies Record<HistoryEntry["action"], { icon: typeof Plus; className: string }>;

export const HISTORY_INITIAL_VISIBLE_COUNT = 10;
