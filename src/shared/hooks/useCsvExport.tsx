import { useCallback, useMemo } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import type { ExportMenuItem } from "@/shared/components/toolbar/ExportMenu";
import { downloadCsv } from "@/shared/lib/export-csv";
import type { CsvExportData } from "@/shared/types/csv-export";

export function useCsvExport({ filename, headers, rows }: CsvExportData) {
  const exportCsv = useCallback(() => {
    downloadCsv(`${filename}.csv`, headers, rows);
  }, [filename, headers, rows]);

  const exportExcel = useCallback(() => {
    downloadCsv(`${filename}-excel.csv`, headers, rows, { delimiter: ";" });
  }, [filename, headers, rows]);

  const items = useMemo<ExportMenuItem[]>(
    () => [
      {
        label: "Exportar para Excel (.csv)",
        icon: <FileSpreadsheet />,
        onSelect: exportExcel,
      },
      { label: "Exportar CSV", icon: <FileText />, onSelect: exportCsv },
    ],
    [exportCsv, exportExcel],
  );

  return { items, exportCsv, exportExcel };
}
