import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";

import {
  useCalendar,
  useCommittedInstallments,
  usePayCalendarEvent,
  useReminders,
} from "@/shared/api/hooks/calendar";
import type { Schemas } from "@/shared/api/client";
import { withQuery } from "@/shared/api/query";
import type { CalendarEvent } from "@/shared/api/types";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import {
  EVENT_KIND_DOTS,
  EVENT_KIND_LABELS,
  eventLabel,
  eventsByDay,
  gridRange,
  isPayable,
  monthGrid,
} from "../calendar-view";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const UPCOMING_DAYS = 14;
const INSTALLMENT_MONTHS = 3;

const shortDay = (isoDay: string) =>
  new Date(`${isoDay}T00:00:00Z`).toLocaleDateString("es-PE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });

function EventRow({ event }: { event: CalendarEvent }) {
  const pay = usePayCalendarEvent();
  return (
    <div className="flex items-center gap-2 py-1.5 text-sm">
      <span className={`h-2 w-2 shrink-0 rounded-full ${EVENT_KIND_DOTS[event.kind]}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className={`truncate ${event.status === "paid" ? "text-muted-foreground line-through" : ""}`}>
          {eventLabel(event)}
        </p>
        <p className="text-xs text-muted-foreground">
          {EVENT_KIND_LABELS[event.kind]}
          {event.status === "late" && <span className="text-destructive"> · atrasado</span>}
        </p>
      </div>
      {event.amount != null && (
        <span className="shrink-0 tabular-nums">{formatCurrency(event.amount, event.currency)}</span>
      )}
      {isPayable(event) && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 shrink-0 px-2"
          disabled={pay.isPending}
          onClick={() =>
            pay.mutate(
              { refType: event.refType as Schemas["PayEventDto"]["refType"], refId: event.refId! },
              { onSuccess: (text) => toast.success(text) },
            )
          }
        >
          <Check className="mr-1 h-3.5 w-3.5" /> Pagado
        </Button>
      )}
    </div>
  );
}

function MonthCalendar() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const { from, to } = gridRange(month, year);
  const events = useCalendar(from, to).data ?? [];
  const byDay = eventsByDay(events);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
  const [selected, setSelected] = useState<string | null>(null);
  const shown = selected ? (byDay.get(selected) ?? []) : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {getMonthName(month)} {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        {monthGrid(month, year).map((week) => (
          <div key={week[0].date} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const dayEvents = byDay.get(day.date) ?? [];
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelected(day.date === selected ? null : day.date)}
                  className={`flex min-h-14 flex-col items-center gap-1 rounded-md border p-1 text-xs transition-colors hover:bg-muted ${
                    day.inMonth ? "" : "opacity-40"
                  } ${day.date === selected ? "border-primary" : ""} ${day.date === today ? "bg-muted font-semibold" : ""}`}
                  aria-label={`${day.day}: ${dayEvents.length} pagos`}
                >
                  <span>{day.day}</span>
                  <span className="flex flex-wrap justify-center gap-0.5">
                    {dayEvents.slice(0, 4).map((event, index) => (
                      <span key={index} className={`h-1.5 w-1.5 rounded-full ${EVENT_KIND_DOTS[event.kind]}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
          {Object.entries(EVENT_KIND_LABELS).map(([kind, label]) => (
            <span key={kind} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${EVENT_KIND_DOTS[kind as CalendarEvent["kind"]]}`} /> {label}
            </span>
          ))}
        </div>
        {selected && (
          <div className="border-t pt-2">
            <p className="mb-1 text-sm font-medium">{shortDay(selected)}</p>
            {shown.length ? (
              shown.map((event, index) => <EventRow key={index} event={event} />)
            ) : (
              <p className="text-sm text-muted-foreground">Nada este día</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingList() {
  const events = (useReminders(UPCOMING_DAYS).data ?? []).filter((event) => event.status !== "paid");
  const byDay = [...eventsByDay(events)];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Próximos {UPCOMING_DAYS} días</CardTitle>
      </CardHeader>
      <CardContent>
        {byDay.length === 0 && <p className="text-sm text-muted-foreground">Nada por pagar. 🎉</p>}
        {byDay.map(([day, list]) => (
          <div key={day} className="border-b py-2 last:border-0">
            <p className="text-xs font-medium uppercase text-muted-foreground">{shortDay(day)}</p>
            {list.map((event, index) => (
              <EventRow key={index} event={event} />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CommittedInstallments() {
  const { data, isLoading } = useCommittedInstallments(INSTALLMENT_MONTHS);
  if (isLoading) return null;
  if (!data?.cards.length) return <EmptyState title="Sin cuotas" description="No hay cuotas de tarjeta en los próximos meses." />;
  const label = (month: number, year: number) => `${getMonthName(month).slice(0, 3)} ${year}`;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarjeta</TableHead>
                {data.months.map((item) => (
                  <TableHead key={`${item.year}-${item.month}`} className="text-right">
                    {label(item.month, item.year)}
                  </TableHead>
                ))}
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.cards.map((card) => (
                <TableRow key={card.paymentMethodId}>
                  <TableCell className="font-medium">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: card.color ?? "var(--muted-foreground)" }} />
                    {card.name}
                  </TableCell>
                  {card.months.map((item) => (
                    <TableCell key={`${item.year}-${item.month}`} className="text-right tabular-nums">
                      {item.count ? formatCurrency(item.amount) : "—"}
                      {item.estimated > 0 && (
                        <Badge variant="outline" className="ml-1 text-[10px]" title="Cuotas por generar, con el monto de la última">
                          {item.estimated} por generar
                        </Badge>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(card.total)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-semibold">Total</TableCell>
                {data.months.map((item) => (
                  <TableCell key={`${item.year}-${item.month}`} className="text-right font-semibold tabular-nums">
                    {formatCurrency(item.total)}
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Detalle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {data.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate">
                {item.description} <span className="text-muted-foreground">{item.installment}</span>
                {item.estimated && (
                  <Badge variant="outline" className="ml-1 text-[10px]">
                    por generar
                  </Badge>
                )}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {label(item.month, item.year)} · {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Calendario (P20, D89): the month on screen, what is due in the next 14 days and the committed card installments
function CalendarPageView() {
  return (
    <Tabs defaultValue="calendar">
      <TabsList>
        <TabsTrigger value="calendar">Calendario</TabsTrigger>
        <TabsTrigger value="installments">Cuotas comprometidas</TabsTrigger>
      </TabsList>
      <TabsContent value="calendar" className="mt-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <MonthCalendar />
          <UpcomingList />
        </div>
      </TabsContent>
      <TabsContent value="installments" className="mt-4">
        <CommittedInstallments />
      </TabsContent>
    </Tabs>
  );
}

export const CalendarPage = withQuery(CalendarPageView);
