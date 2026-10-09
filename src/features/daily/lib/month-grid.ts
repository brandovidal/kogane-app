export interface GridExpense {
  id: string;
  spentAt: string;
  amount: number;
  currency?: string | null;
}

export type DayTotals = Partial<Record<"PEN" | "USD", number>>;

export interface DayCell<T extends GridExpense> {
  /** YYYY-MM-DD */
  day: string;
  /** Day of the month (1–31) */
  date: number;
  inMonth: boolean;
  expenses: T[];
  totals: DayTotals;
}

const pad = (value: number) => String(value).padStart(2, "0");
const toDay = (year: number, month: number, date: number) =>
  `${year}-${pad(month)}-${pad(date)}`;

/** Adds `amount` to its currency (anything but USD counts as soles). */
export function addToTotals(
  totals: DayTotals,
  amount: number,
  currency?: string | null,
): DayTotals {
  const key = currency === "USD" ? "USD" : "PEN";
  return { ...totals, [key]: (totals[key] ?? 0) + amount };
}

/**
 * Weeks (Monday first) of the month, padded with days of the neighbouring months so every week has 7 cells.
 * Each cell carries the expenses of its day and their totals per currency (board Calendario).
 */
export function buildMonthGrid<T extends GridExpense>(
  year: number,
  month: number,
  expenses: T[],
): DayCell<T>[][] {
  const byDay = new Map<string, T[]>();
  for (const expense of expenses) {
    const day = expense.spentAt.slice(0, 10);
    byDay.set(day, [...(byDay.get(day) ?? []), expense]);
  }

  const first = new Date(Date.UTC(year, month - 1, 1));
  // getUTCDay: Sunday = 0 → Monday-first offset
  const lead = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const total = Math.ceil((lead + daysInMonth) / 7) * 7;

  const cells: DayCell<T>[] = [];
  for (let index = 0; index < total; index += 1) {
    const date = new Date(Date.UTC(year, month - 1, 1 - lead + index));
    const day = toDay(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
    );
    const dayExpenses = byDay.get(day) ?? [];
    cells.push({
      day,
      date: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month - 1,
      expenses: dayExpenses,
      totals: dayExpenses.reduce<DayTotals>(
        (sum, expense) => addToTotals(sum, expense.amount, expense.currency),
        {},
      ),
    });
  }

  const weeks: DayCell<T>[][] = [];
  for (let index = 0; index < cells.length; index += 7)
    weeks.push(cells.slice(index, index + 7));
  return weeks;
}

export const WEEKDAY_HEADERS = [
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
  "Dom",
] as const;
