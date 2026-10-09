import { useState } from "react";
import { Plus } from "lucide-react";
import type { Debt } from "@/shared/api/types";
import { withQuery } from "@/shared/api/query";
import { usePeriod } from "@/shared/stores/period.store";
import { Button } from "@/ui/button";
import { DebtDialog } from "../components/dialogs/DebtDialog";
import { DebtPaymentDialog } from "../components/dialogs/DebtPaymentDialog";
import { DebtListView } from "./DebtListView";
import { DebtSummaryView } from "./DebtSummaryView";
import type { Direction } from "@/features/debts/lib/debt-filters";

export type DebtsMode = "collect" | "owe" | "summary";

function DebtsPageView({ mode }: { mode: DebtsMode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paying, setPaying] = useState<Debt | undefined>();
  const month = usePeriod((state) => state.month);
  const year = usePeriod((state) => state.year);
  const direction: Direction = mode === "owe" ? "i_owe" : "owed_to_me";

  if (mode === "summary") {
    return (
      <div className="space-y-4">
        <DebtSummaryView month={month} year={year} />
        <DebtPaymentDialog
          debt={paying}
          onOpenChange={(open) => !open && setPaying(undefined)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DebtListView
        direction={direction}
        splitGroupingSheet={mode === "collect"}
        onPay={setPaying}
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Nueva
          </Button>
        }
      />
      <DebtDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        direction={direction}
      />
      <DebtPaymentDialog
        debt={paying}
        onOpenChange={(open) => !open && setPaying(undefined)}
      />
    </div>
  );
}

export const DebtsPage = withQuery(DebtsPageView);
