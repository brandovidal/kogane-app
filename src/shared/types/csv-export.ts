export interface CsvExportData {
  /** File name without the extension. */
  filename: string;
  headers: string[];
  rows: unknown[][];
}
