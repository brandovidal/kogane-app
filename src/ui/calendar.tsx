"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/utils/cn";
import { Button } from "@/ui/button";

export interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const sameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
}: CalendarProps) {
  const [month, setMonth] = useState(() =>
    monthOf(selected ?? nearestDate(new Date(), minDate, maxDate)),
  );

  useEffect(() => {
    if (selected)
      setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [selected]);

  const days = useMemo(() => {
    const firstWeekday =
      (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
    const monthDays = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    return Array.from(
      { length: Math.ceil((firstWeekday + monthDays) / 7) * 7 },
      (_, index) => {
        const date = new Date(
          month.getFullYear(),
          month.getMonth(),
          index - firstWeekday + 1,
        );
        return { date, inMonth: date.getMonth() === month.getMonth() };
      },
    );
  }, [month]);
  const monthLabel = new Intl.DateTimeFormat("es-PE", {
    month: "long",
    year: "numeric",
  }).format(month);
  const weekdays = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div className={cn("w-[18rem] select-none", className)}>
      <div className="mb-2 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Mes anterior"
          disabled={!!minDate && month <= monthOf(minDate)}
          onClick={() =>
            setMonth(
              (current) =>
                new Date(current.getFullYear(), current.getMonth() - 1, 1),
            )
          }
        >
          <ChevronLeft />
        </Button>
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Mes siguiente"
          disabled={!!maxDate && month >= monthOf(maxDate)}
          onClick={() =>
            setMonth(
              (current) =>
                new Date(current.getFullYear(), current.getMonth() + 1, 1),
            )
          }
        >
          <ChevronRight />
        </Button>
      </div>
      <div
        className="grid grid-cols-7 text-center text-xs text-muted-foreground"
        aria-hidden="true"
      >
        {weekdays.map((day, index) => (
          <span key={`${day}-${index}`} className="py-1">
            {day}
          </span>
        ))}
      </div>
      <div
        className="grid grid-cols-7 gap-1"
        role="group"
        aria-label={monthLabel}
      >
        {days.map(({ date, inMonth }) => {
          const disabled =
            (minDate && date < startOfDay(minDate)) ||
            (maxDate && date > startOfDay(maxDate));
          const isSelected = selected ? sameDay(selected, date) : false;
          return (
            <button
              key={date.toISOString()}
              type="button"
              aria-label={date.toLocaleDateString("es-PE", {
                dateStyle: "full",
              })}
              aria-pressed={isSelected}
              aria-current={sameDay(date, new Date()) ? "date" : undefined}
              disabled={!inMonth || !!disabled}
              onClick={() => onSelect(date)}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                !inMonth && "invisible",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                sameDay(date, new Date()) &&
                  !isSelected &&
                  "border border-primary/40",
                (disabled || !inMonth) && "pointer-events-none opacity-40",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function monthOf(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function nearestDate(date: Date, minDate?: Date, maxDate?: Date) {
  if (minDate && date < minDate) return minDate;
  if (maxDate && date > maxDate) return maxDate;
  return date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
