import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/shared/lib/currency";
import { type BudgetGroupSummary } from "@/features/budget-groups/services/budget-group.service";
import { CategoryLabel } from "@/features/categories/components/CategoryLabel";

interface BudgetGroupCardsProps {
  groups: BudgetGroupSummary[];
  onEdit: (groupId: string) => void;
  onDelete: (groupId: string) => void;
}

export function BudgetGroupCards({ groups, onEdit, onDelete }: BudgetGroupCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {groups.map(({ group, assignedAmount, spentAmount, categories }) => {
        const available = assignedAmount - spentAmount;
        const progress = assignedAmount > 0 ? Math.min((spentAmount / assignedAmount) * 100, 100) : 0;
        const isOver = spentAmount > assignedAmount;

        return (
          <Card key={group.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">
                <span className="mr-2">{group.emoji}</span>
                {group.name}
                <span className="ml-2 text-sm font-normal text-muted-foreground">({group.percentage}%)</span>
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(group.id)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(group.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatCurrency(spentAmount)} / {formatCurrency(assignedAmount)}
                </span>
                <span className={`font-medium ${isOver ? "text-red-500" : "text-green-600"}`}>
                  {formatCurrency(available)} disponible
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full transition-all ${isOver ? "bg-red-500" : "bg-primary"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {categories.length > 0 && (
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <CategoryLabel name={cat.name} icon={cat.icon} color={cat.color} />
                      </div>
                      <span className="text-muted-foreground">{formatCurrency(cat.spent)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
