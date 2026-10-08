import { usePeople } from "@/shared/api/hooks/catalogs";
import { useExpenses } from "@/features/expenses/hooks/expenses";
import { paidAndOwn } from "@/features/expenses/lib/shared-expense";
import { EXPENSE_RESOURCES } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/ui/sheet";
import type { DonutSlice } from "@/features/budget/lib/budget-view";

export function BudgetCategoryDetail({
  slice,
  month,
  year,
  onClose,
}: {
  slice: DonutSlice | null;
  month: number;
  year: number;
  onClose: () => void;
}) {
  const period = { month, year };
  const me = usePeople().data?.find((person) => person.isDefault)?.id;
  const daily = useExpenses(EXPENSE_RESOURCES.daily, period).data ?? [];
  const fixed = useExpenses(EXPENSE_RESOURCES.fixedCost, period).data ?? [];
  const cards = useExpenses(EXPENSE_RESOURCES.creditCard, period).data ?? [];
  const categoryId = slice?.key === "none" ? null : slice?.key;
  const rows = [
    ...daily.map((item) => ({ ...item, when: item.spentAt })),
    ...fixed.map((item) => ({ ...item, when: item.paymentDate ?? null })),
    ...cards.map((item) => ({ ...item, when: item.processDate ?? null })),
  ]
    .filter(
      (item) =>
        item.personId === me &&
        (item.categoryId ?? null) === categoryId &&
        item.currency === "PEN",
    )
    .sort((a, b) => (b.when ?? "").localeCompare(a.when ?? ""));

  return (
    <Sheet open={!!slice} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{slice?.name}</SheetTitle>
        </SheetHeader>
        <ul className="space-y-2 px-4 pb-4 text-sm">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-start justify-between gap-2 border-b pb-2"
            >
              <div>
                <p className="font-medium">{row.description}</p>
                <p className="text-xs text-muted-foreground">
                  {row.when ? formatDate(row.when) : "—"}
                </p>
              </div>
              <span className="tabular-nums">
                {formatCurrency(paidAndOwn(row).own)}
              </span>
            </li>
          ))}
          {!rows.length && (
            <li className="text-muted-foreground">Sin gastos</li>
          )}
        </ul>
        <div className="px-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
