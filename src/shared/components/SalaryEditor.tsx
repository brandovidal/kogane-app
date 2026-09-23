import { useState } from "react";
import { Button } from "@/ui/button";
import { Pencil } from "lucide-react";
import { formatCurrency } from "@/shared/lib/currency";
import { useSummary } from "@/shared/api/hooks/summary";
import { withQuery } from "@/shared/api/query";
import { usePeriod } from "@/shared/stores/period.store";
import { SalaryDialog } from "./SalaryDialog";

// Salary of the month and how much of it was spent (/v1/summary)
function SalaryEditorView() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const { data: summary } = useSummary(month, year);
  const [dialogOpen, setDialogOpen] = useState(false);

  const salary = summary?.budget?.salary ?? 0;
  const spentPercent = salary > 0 ? Math.round(((summary?.spentPen ?? 0) / salary) * 100) : 0;

  return (
    <div className="flex items-center gap-1.5">
      <span className="hidden sm:inline text-sm font-medium">{formatCurrency(salary)}</span>
      <span className="text-xs text-muted-foreground">({spentPercent}%)</span>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDialogOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <SalaryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        month={month}
        year={year}
        salary={salary}
        limitPercent={summary?.budget?.limitPercent ?? 100}
      />
    </div>
  );
}

export const SalaryEditor = withQuery(SalaryEditorView);
