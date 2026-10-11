import { useMemo, useState } from "react";

import { useExpenses } from "@/features/expenses/hooks/expenses";
import { useRecurringFromSeries } from "../hooks/recurring";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { usePeople } from "@/shared/api/hooks/catalogs";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { usePeriod } from "@/shared/stores/period.store";
import { Button } from "@/ui/button";

export type SeriesSource = "fixed-costs" | "subscriptions";

const TEXTS: Record<
  SeriesSource,
  { title: string; hint: string; none: string }
> = {
  "fixed-costs": {
    title: "Pasar desde Costos fijos",
    hint: "Elige un gasto fijo y se repite cada mes.",
    none: "No hay costos fijos en este período.",
  },
  subscriptions: {
    title: "Pasar desde Plataformas",
    hint: "Elige una suscripción.",
    none: "No hay plataformas en este período.",
  },
};

// One entry per series (same description and person): the API copies the latest row of the one picked
export function FromSeriesDialog({
  source,
  onOpenChange,
}: {
  source: SeriesSource | null;
  onOpenChange: (open: boolean) => void;
}) {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const open = source !== null;
  const fixed = useExpenses(
    EXPENSE_RESOURCES.fixedCost,
    { month, year },
    undefined,
    source === "fixed-costs",
  ).data;
  const subs = useExpenses(
    EXPENSE_RESOURCES.subscription,
    { month, year },
    "platform",
    source === "subscriptions",
  ).data;
  const people = new Map((usePeople().data ?? []).map((p) => [p.id, p.name]));
  const convert = useRecurringFromSeries();
  const [picked, setPicked] = useState<string | null>(null);

  const rows = useMemo(() => {
    const list = source === "fixed-costs" ? fixed : subs;
    const seen = new Map<string, NonNullable<typeof list>[number]>();
    for (const row of list ?? []) {
      const key = `${row.description.trim().toLowerCase()}|${row.personId}`;
      if (!seen.has(key)) seen.set(key, row);
    }
    return [...seen.values()];
  }, [source, fixed, subs]);

  const close = (next: boolean) => {
    if (!next) setPicked(null);
    onOpenChange(next);
  };
  const texts = source ? TEXTS[source] : TEXTS["fixed-costs"];

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={close}
      title={texts.title}
      description={texts.hint}
      footer={
        <>
          <Button variant="outline" onClick={() => close(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!picked || !source || convert.isPending}
            onClick={() =>
              source &&
              picked &&
              convert.mutate(
                { resource: source, id: picked },
                { onSuccess: () => close(false) },
              )
            }
          >
            Pasar a Recurrentes
          </Button>
        </>
      }
    >
      <div
        role="radiogroup"
        className="max-h-72 space-y-1 overflow-y-auto rounded-md border p-2"
      >
        {rows.length === 0 && (
          <p className="p-2 text-sm text-muted-foreground">{texts.none}</p>
        )}
        {rows.map((row) => (
          <label
            key={row.id}
            className="flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50"
          >
            <span className="flex min-w-0 items-center gap-2">
              <input
                type="radio"
                name="series"
                checked={picked === row.id}
                onChange={() => setPicked(row.id)}
              />
              <span className="truncate">
                {row.description}{" "}
                <span className="text-muted-foreground">
                  · {people.get(row.personId) ?? ""}
                </span>
              </span>
            </span>
            <span className="shrink-0 tabular-nums">
              {formatCurrency(row.amount, row.currency)}
            </span>
          </label>
        ))}
      </div>
    </ResponsiveDialog>
  );
}
