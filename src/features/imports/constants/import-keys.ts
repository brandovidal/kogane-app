import type { ImportRowsParams } from "../types/import-types";

export const importKeys = {
  all: ["imports"] as const,
  list: ["imports", "list"] as const,
  detail: (id: string) => ["imports", "detail", id] as const,
  rows: (id: string, params: ImportRowsParams) =>
    ["imports", "rows", id, params] as const,
};
