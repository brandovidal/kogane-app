// Public module API. Internal files import concrete modules to avoid cycles.
export type { StatementTab } from "./statement-view";
export {
  rowsOf,
  countsOf,
  totalsOf,
  totalsMatch,
  uploadErrorText,
  ROW_RESULT_LABELS,
  rowName,
  confirmCreateText,
} from "./statement-view";
