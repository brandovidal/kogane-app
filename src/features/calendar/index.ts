// Public module API. Internal files import concrete modules to avoid cycles.
export { CalendarPage } from "./components/CalendarPage";
export {
  useCalendar,
  useReminders,
  useCommittedInstallments,
  usePayCalendarEvent,
} from "./hooks/calendar";
export {
  EVENT_KIND_LABELS,
  EVENT_KIND_DOTS,
  isPayable,
  eventLabel,
  monthGrid,
  eventsByDay,
  gridRange,
} from "./lib/calendar-view";
export {
  PAY_KINDS,
  PAY_METHODS,
  buildPayBody,
  payAmountError,
} from "./lib/payment-details";
export type { GridDay } from "./lib/calendar-view";
