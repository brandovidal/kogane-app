import { useState } from "react";
import { z } from "zod";
import type { MonthlyPeriod } from "@/shared/types/period";
import {
  incomeFormDefaults,
  parseIncomeForm,
  type IncomeFormDraft,
} from "../lib/income-form";
import { useSaveIncome, type Income } from "./budget";

export function useIncomeForm(
  income: Income | null,
  period: MonthlyPeriod,
  onSaved: (period: MonthlyPeriod) => void,
) {
  const [value, setValue] = useState(() => incomeFormDefaults(income, period));
  const [touched, setTouched] = useState<
    Partial<Record<keyof IncomeFormDraft, boolean>>
  >({});
  const mutation = useSaveIncome();
  const validation = parseIncomeForm(value);
  const errors = validation.success
    ? {}
    : z.flattenError(validation.error).fieldErrors;
  const update = <K extends keyof IncomeFormDraft>(
    key: K,
    next: IncomeFormDraft[K],
  ) => setValue((current) => ({ ...current, [key]: next }));
  const touch = (key: keyof IncomeFormDraft) =>
    setTouched((current) => ({ ...current, [key]: true }));
  const errorFor = (key: keyof IncomeFormDraft) =>
    touched[key] ? errors[key]?.[0] : undefined;
  const save = () => {
    if (!validation.success || mutation.isPending) return;
    mutation.mutate(
      { id: income?.id, body: validation.data },
      {
        onSuccess: () =>
          onSaved({ month: validation.data.month, year: validation.data.year }),
      },
    );
  };
  return {
    value,
    update,
    setValue,
    touch,
    errorFor,
    save,
    pending: mutation.isPending,
    canSave: validation.success && !mutation.isPending,
  };
}

export type IncomeFormController = ReturnType<typeof useIncomeForm>;
