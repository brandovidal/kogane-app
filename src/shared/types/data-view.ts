import type { ReactNode } from "react";

export type ViewMode = "table" | "cards";

// One definition of the columns shows a list as a table or as cards (D80). In cards: the title and the actions go on
// top, the amount big, and the rest as "Header: value" lines.
export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  role?: "title" | "amount" | "actions" | "meta";
  className?: string;
}

export interface DataViewProps<T> {
  items: T[];
  columns: Column<T>[];
  rowKey: (item: T) => string;
  view: ViewMode;
  footer?: ReactNode; // under the table, or under the cards
  extraCard?: ReactNode; // e.g. the dashed "Nueva plataforma" card
  // Selección múltiple (D115): a checkbox per row (and one for all in the table header)
  selected?: Set<string>;
  onSelectedChange?: (selected: Set<string>) => void;
}

