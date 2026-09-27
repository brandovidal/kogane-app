import { useState } from "react";
import { CalendarDays, X } from "lucide-react";

import { Button, buttonVariants } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { cn } from "@/shared/utils/cn";

export interface DatePickerProps {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const parseDate = (value?: string | null) => {
  if (!value) return undefined;
  const parsed = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const displayDate = (date: Date) =>
  date.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  ariaLabel,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const date = parseDate(value);

  return (
    <div className="flex min-w-0 gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          aria-label={ariaLabel}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "min-w-0 flex-1 justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarDays className="size-4" />
          <span className="min-w-0 flex-1 truncate">{date ? displayDate(date) : placeholder}</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <Calendar
            selected={date}
            onSelect={(next) => {
              onChange(dateKey(next));
              setOpen(false);
            }}
            minDate={parseDate(minDate)}
            maxDate={parseDate(maxDate)}
          />
        </PopoverContent>
      </Popover>
      {date && (
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label={`Limpiar ${ariaLabel.toLocaleLowerCase()}`} onClick={() => onChange("")}>
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
