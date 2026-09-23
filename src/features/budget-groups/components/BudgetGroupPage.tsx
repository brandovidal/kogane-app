import { useState } from "react";
import { useDeleteBudgetGroup } from "@/shared/api/hooks/catalogs";
import { withQuery } from "@/shared/api/query";
import type { BudgetGroup } from "@/shared/api/types";
import { usePeriod } from "@/shared/stores/period.store";
import { useBudgetGroupSummaries } from "../budget-group.service";
import { BudgetGroupTable } from "./BudgetGroupTable";
import { BudgetGroupCards } from "./BudgetGroupCards";
import { BudgetGroupDialog } from "./BudgetGroupDialog";
import { ViewToggle } from "@/shared/components/ViewToggle";
import { Button } from "@/ui/button";
import { Plus } from "lucide-react";

function BudgetGroupPageView() {
  const [view, setView] = useState<"table" | "cards">("table");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<BudgetGroup | undefined>();

  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const { salary, groups: budgetGroups, summaries } = useBudgetGroupSummaries(selectedMonth, selectedYear);
  const deleteBudgetGroup = useDeleteBudgetGroup();

  const handleEdit = (groupId: string) => {
    const group = budgetGroups.find((g) => g.id === groupId);
    if (group) {
      setEditingGroup(group);
      setDialogOpen(true);
    }
  };

  const handleDelete = (groupId: string) => {
    deleteBudgetGroup.mutate(groupId);
  };

  const handleAdd = () => {
    setEditingGroup(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={setView} />
          <span className="text-sm text-muted-foreground">
            Sueldo: S/ {salary.toLocaleString()} · {budgetGroups.reduce((s, g) => s + g.percentage, 0)}% asignado
          </span>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo grupo
        </Button>
      </div>

      {view === "table" ? (
        <BudgetGroupTable
          groups={summaries}
          salary={salary}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <BudgetGroupCards
          groups={summaries}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <BudgetGroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editingGroup}
      />
    </div>
  );
}

export const BudgetGroupPage = withQuery(BudgetGroupPageView);
