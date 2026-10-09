import { SubscriptionList } from "@/features/subscriptions/components/SubscriptionList";
import { useState } from "react";
import { useUrlFilters } from "@/shared/hooks/useUrlFilters";
import { withQuery } from "@/shared/api/query";
import { RecurringDialog } from "./RecurringDialog";

import { RecurringList } from "./RecurringList";

// Recurrentes (D107, D108): the services, yearly and other charges of the month, and the templates that create them
function RecurringPageView() {
  const [params, setParams] = useUrlFilters<{ vista?: string }>(["vista"]);
  const [createOpen, setCreateOpen] = useState(false);
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
    </div>
  );
}

export const RecurringPage = withQuery(RecurringPageView);
