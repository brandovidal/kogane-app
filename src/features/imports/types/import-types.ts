import type {
  ImportDetail,
  ImportRowStatus,
  ImportTab,
} from "@/shared/api/types";

export type ImportSource = "notion" | "statement";

export interface HistoryItem {
  key: string; // "notion:<id>" | "statement:<id>"
  source: ImportSource;
  id: string;
  title: string;
  detail: string;
  status: string;
  pending: boolean; // still waiting for a decision
  createdAt: string;
}

export interface ImportRowsParams {
  tab: ImportTab;
  status?: ImportRowStatus;
  q?: string;
  page: number;
}

export interface ImportUploadCardProps {
  onRead: (key: string) => void;
}
export interface ImportHistoryCardProps {
  items: HistoryItem[];
  current: string | null;
  onSelect: (key: string) => void;
  onClose?: () => void;
}
export interface ImportRowsTabProps {
  batchId: string;
  tab: ImportTab;
  applied: boolean;
}
export interface ImportSummaryTabProps {
  batch: ImportDetail;
}
export interface ImportDetailViewProps {
  id: string;
}
export interface ImportRowStatusBadgeProps {
  status: ImportRowStatus;
}

import type { Schemas } from "@/shared/api/client";

export type ListImportResult = Schemas["ListImportResponseDto"]["data"];
