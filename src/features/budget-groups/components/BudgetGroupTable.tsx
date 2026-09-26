import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/ui/table";
import { Button } from "@/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/shared/lib/currency";
import type { BudgetGroupSummary } from "../budget-group.service";

interface BudgetGroupTableProps {
  groups: BudgetGroupSummary[];
  onEdit: (groupId: string) => void;
  onDelete: (groupId: string) => void;
}

export function BudgetGroupTable({ groups, onEdit, onDelete }: BudgetGroupTableProps) {
  const totalAssigned = groups.reduce((sum, g) => sum + g.assignedAmount, 0);
  const totalSpent = groups.reduce((sum, g) => sum + g.spentAmount, 0);
  const totalPercentage = groups.reduce((sum, g) => sum + g.group.percentage, 0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Grupo</TableHead>
          <TableHead className="text-center">%</TableHead>
          <TableHead className="text-right">Asignado</TableHead>
          <TableHead className="text-right">Gastado</TableHead>
          <TableHead className="text-right">Disponible</TableHead>
          <TableHead className="text-center">Categorías</TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map(({ group, assignedAmount, spentAmount, categories }) => {
          const available = assignedAmount - spentAmount;
          return (
            <TableRow key={group.id}>
              <TableCell className="font-medium">
                <span className="mr-2">{group.emoji}</span>
                {group.name}
              </TableCell>
              <TableCell className="text-center">{group.percentage}%</TableCell>
              <TableCell className="text-right">{formatCurrency(assignedAmount)}</TableCell>
              <TableCell className="text-right">{formatCurrency(spentAmount)}</TableCell>
              <TableCell className={`text-right font-medium ${available < 0 ? "text-red-500" : "text-green-600"}`}>
                {formatCurrency(available)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-wrap justify-center gap-1">
                  {categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-block rounded-full px-2 py-0.5 text-xs text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(group.id)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(group.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="font-bold">Total</TableCell>
          <TableCell className="text-center font-bold">{totalPercentage}%</TableCell>
          <TableCell className="text-right font-bold">{formatCurrency(totalAssigned)}</TableCell>
          <TableCell className="text-right font-bold">{formatCurrency(totalSpent)}</TableCell>
          <TableCell className={`text-right font-bold ${totalAssigned - totalSpent < 0 ? "text-red-500" : "text-green-600"}`}>
            {formatCurrency(totalAssigned - totalSpent)}
          </TableCell>
          <TableCell />
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  );
}
