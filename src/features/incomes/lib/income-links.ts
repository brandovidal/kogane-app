import type { MonthlyPeriod } from "@/shared/types/period";

export const incomesHref = ({ month, year }: MonthlyPeriod) =>
  `/ingresos?month=${month}&year=${year}`;
