import { useEffect, useState } from "react";
import { z } from "zod";
import { periodStore } from "@/shared/stores/period.store";
import {
  monthlySalarySchema,
  salaryPeriodFromUrl,
} from "../lib/monthly-salary";
import { useSetBudget, useSummary } from "./summary";
import type { MonthlyPeriod } from "@/shared/types/period";

interface SalaryFields {
  periodKey: string;
  salary: string;
  limitPercent: string;
}

export function useMonthlySalary(
  open: boolean,
  onSaved: (period: MonthlyPeriod) => void,
  initialPeriod?: MonthlyPeriod,
) {
  const [period, setPeriod] = useState(
    () =>
      initialPeriod ??
      salaryPeriodFromUrl(
        new URLSearchParams(
          typeof window === "undefined" ? "" : window.location.search,
        ),
        periodStore.getState(),
      ),
  );
  const [fields, setFields] = useState<SalaryFields | null>(null);
  const query = useSummary(period.month, period.year, open);
  const mutation = useSetBudget();
  const periodKey = `${period.year}-${period.month}`;
  const summary = query.data;

  useEffect(() => {
    if (!open) {
      setFields(null);
      return;
    }
    if (
      !summary ||
      summary.month !== period.month ||
      summary.year !== period.year
    )
      return;
    // Populate once for each selected month; a background refresh must preserve edits.
    setFields((current) =>
      current?.periodKey === periodKey
        ? current
        : {
            periodKey,
            salary: String(summary.budget?.salary ?? 0),
            limitPercent: String(summary.budget?.limitPercent ?? 100),
          },
    );
  }, [open, summary, period.month, period.year, periodKey]);

  const ready = fields?.periodKey === periodKey && !!summary && !query.isError;
  const salaryValue = fields?.periodKey === periodKey ? fields.salary : "";
  const percentValue =
    fields?.periodKey === periodKey ? fields.limitPercent : "";
  const validation = monthlySalarySchema.safeParse({
    ...period,
    salary: salaryValue.trim() ? Number(salaryValue) : NaN,
    limitPercent: percentValue.trim() ? Number(percentValue) : NaN,
  });
  const errors =
    ready && !validation.success
      ? z.flattenError(validation.error).fieldErrors
      : {};

  const updateField = (key: "salary" | "limitPercent", value: string) => {
    setFields((current) =>
      current?.periodKey === periodKey ? { ...current, [key]: value } : current,
    );
  };
  const save = () => {
    if (!ready || !validation.success || mutation.isPending) return;
    mutation.mutate(validation.data, { onSuccess: () => onSaved(period) });
  };

  return {
    period,
    setPeriod,
    salaryValue,
    percentValue,
    updateField,
    errors,
    ready,
    canSave: ready && validation.success && !mutation.isPending,
    saving: mutation.isPending,
    loading: query.isPending,
    error: query.isError,
    retry: () => query.refetch(),
    summary,
    limit: validation.success
      ? (validation.data.salary * validation.data.limitPercent) / 100
      : null,
    save,
  };
}
