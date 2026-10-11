import { SubscriptionList } from "@/features/subscriptions/components/SubscriptionList";
import { useState } from "react";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { withQuery } from "@/shared/api/query";
import { ChevronDown, Repeat } from "lucide-react";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { RecurringDialog } from "./RecurringDialog";
import { FromSeriesDialog, type SeriesSource } from "./FromSeriesDialog";

import { RecurringList } from "./RecurringList";

// Recurrentes (D107, D108): the services, yearly and other charges of the month, and the templates that create them
function RecurringPageView() {
  const [params, setParams] = useUrlFilters<{ vista?: string }>(["vista"]);
  const [createOpen, setCreateOpen] = useState(false);
  const [fromSeries, setFromSeries] = useState<SeriesSource | null>(null);
  const view = params.vista === "plantillas" ? "plantillas" : "mes";
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Vistas de recurrentes"
          className="inline-flex h-9 items-center gap-1 rounded-lg bg-muted/60 p-1"
        >
          {(
            [
              ["mes", "Del mes"],
              ["plantillas", "Plantillas"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={view === value}
              onClick={() => setParams(value === "mes" ? {} : { vista: value })}
              className={`h-7 rounded-md px-2.5 text-sm transition-colors ${
                view === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-9">
              <Repeat className="mr-1 h-4 w-4" /> Pasar desde…
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setFromSeries("fixed-costs")}>
              <div>
                <p>Pasar desde Costos fijos…</p>
                <p className="text-xs text-muted-foreground">
                  Elige un gasto fijo y se repite cada mes
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setFromSeries("subscriptions")}>
              <div>
                <p>Pasar desde Plataformas…</p>
                <p className="text-xs text-muted-foreground">
                  Elige una suscripción
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {view === "mes" ? (
        <SubscriptionList
          group="recurring"
          onCreateRecurringTemplate={() => setCreateOpen(true)}
        />
      ) : (
        <RecurringList />
      )}
      <RecurringDialog open={createOpen} onOpenChange={setCreateOpen} />
      <FromSeriesDialog
        source={fromSeries}
        onOpenChange={(open) => !open && setFromSeries(null)}
      />
    </div>
  );
}

export const RecurringPage = withQuery(RecurringPageView);
