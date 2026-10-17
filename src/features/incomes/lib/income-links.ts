import type { MonthlyPeriod } from "@/shared/types/period";

export const incomesHref = ({ month, year }: MonthlyPeriod) => `/presupuesto?tab=ingresos&month=${month}&year=${year}`;
