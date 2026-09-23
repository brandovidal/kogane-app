import { useState, useEffect } from "react";
import { useSetBudget } from "@/shared/api/hooks/summary";
import { getMonthName } from "@/shared/lib/dates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { formatCurrency } from "@/shared/lib/currency";

interface SalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: number;
  year: number;
  salary: number;
  limitPercent: number;
}

// Salary and spending limit of one month (PUT /v1/summary/budget)
export function SalaryDialog({ open, onOpenChange, month, year, salary, limitPercent: budgetLimitPercent }: SalaryDialogProps) {
  const setBudget = useSetBudget();

  const [salaryValue, setSalaryValue] = useState(String(salary));
  const [percentValue, setPercentValue] = useState(String(budgetLimitPercent));

  useEffect(() => {
    if (open) {
      setSalaryValue(String(salary));
      setPercentValue(String(budgetLimitPercent));
    }
  }, [open, salary, budgetLimitPercent]);

  const salaryNum = parseFloat(salaryValue) || 0;
  const percentNum = parseFloat(percentValue) || 0;
  const limit = salaryNum * percentNum / 100;

  const handleSave = () => {
    if (salaryNum > 0 && percentNum >= 1 && percentNum <= 100) {
      setBudget.mutate(
        { month, year, salary: salaryNum, limitPercent: percentNum },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sueldo de {getMonthName(month)} {year}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sueldo mensual</label>
            <Input
              type="number"
              value={salaryValue}
              onChange={(e) => setSalaryValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">% límite de gasto</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={percentValue}
              onChange={(e) => setPercentValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            Límite: {formatCurrency(limit)}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={setBudget.isPending}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
