const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const isoDay = (value: string) => value.slice(0, 10);

const utcTime = (day: string) => {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year, month - 1, date);
};

const localDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** "Hoy · mar 6 oct", "Ayer · lun 5 oct" or "Sáb 3 oct" (board Por día). Without `today` it never says Hoy/Ayer. */
export function dayLabel(spentAt: string, today?: Date | null): string {
  const day = isoDay(spentAt);
  const time = utcTime(day);
  const date = new Date(time);
  const text = `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
  if (today) {
    const diff = Math.round((utcTime(localDay(today)) - time) / 86_400_000);
    if (diff === 0) return `Hoy · ${text}`;
    if (diff === 1) return `Ayer · ${text}`;
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Group key of an expense for "Por día". */
export const dayKey = isoDay;
