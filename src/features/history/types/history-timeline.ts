import type { HistoryEntry } from "@/shared/api/types";

export interface HistoryDayGroup {
  day: string;
  label: string;
  entries: HistoryEntry[];
}

export interface HistoryTimelineProps {
  entries: HistoryEntry[];
  labels: Record<string, string>;
  showRecord?: boolean;
  compact?: boolean;
}
