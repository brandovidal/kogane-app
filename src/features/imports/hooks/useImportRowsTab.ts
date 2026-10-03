import { useState } from "react";
import { useImportRows } from "@/features/imports/hooks/imports";
import type { ImportRowStatus, ImportTab } from "@/shared/api/types";
import { pageCount } from "@/features/imports/lib/import-view";
import {
  IMPORT_ISSUE_STATUSES,
  IMPORT_ROW_STATUSES,
} from "../constants/import-options";

export function useImportRowsTab(batchId: string, tab: ImportTab) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ImportRowStatus | undefined>();
  const query = useImportRows(batchId, { tab, status, q, page });
  const data = query.data;
  const pages = pageCount(data?.total ?? 0, data?.pageSize ?? 50);
  const issues = tab === "issues";
  const statuses = issues ? IMPORT_ISSUE_STATUSES : IMPORT_ROW_STATUSES;

  return {
    page,
    setPage,
    q,
    setQ,
    status,
    setStatus,
    data,
    pages,
    issues,
    statuses,
  };
}
