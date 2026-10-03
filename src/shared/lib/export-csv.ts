export interface CsvOptions {
  delimiter?: string;
  bom?: boolean;
}

const csvCell = (value: unknown, delimiter: string) => {
  let text = value == null ? "" : String(value);
  // Prevent spreadsheet apps from interpreting user-entered values as formulas.
  if (/^[\s]*[=+@]/.test(text)) text = `'${text}`;
  return /["\r\n]/.test(text) || text.includes(delimiter)
    ? `"${text.replaceAll('"', '""')}"`
    : text;
};

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: unknown[][],
  { delimiter = ",", bom = true }: CsvOptions = {},
) {
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => csvCell(value, delimiter)).join(delimiter))
    .join("\r\n");
  const blob = new Blob([`${bom ? "\uFEFF" : ""}${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
