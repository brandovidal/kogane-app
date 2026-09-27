// Public module API. Internal files import concrete modules to avoid cycles.
export { CalendarPage } from "./components/CalendarPage";
export { calendarKeys, useCalendar, useReminders, useCommittedInstallments, usePayCalendarEvent } from "./hooks/calendar";
export { EVENT_KIND_LABELS, EVENT_KIND_DOTS, isPayable, eventLabel, monthGrid, eventsByDay, gridRange } from "./lib/calendar-view";
export type { GridDay } from "./lib/calendar-view";
