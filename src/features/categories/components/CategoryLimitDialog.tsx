import { useState } from 'react'

import type { Category } from '@/shared/api/types'
import { useDeleteCategoryBudget, useSaveCategoryBudget, type CategoryBudgetLine } from '@/features/categories/hooks/category-budgets'
import { ResponsiveDialog } from '@/shared/components/dialogs/ResponsiveDialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'

// The limit of one category: for every month, or only the month on screen (it replaces the general one then)
export function CategoryLimitDialog({
  category,
  line,
  month,
  year,
  onClose,
}: {
  category: Category
  line?: CategoryBudgetLine
  month: number
  year: number
  onClose: () => void
}) {
  const save = useSaveCategoryBudget()
  const remove = useDeleteCategoryBudget()
  const [limit, setLimit] = useState(line?.limit != null ? String(line.limit) : '')
  const [threshold, setThreshold] = useState(String(line?.alertThreshold ?? 80))
  const [monthOnly, setMonthOnly] = useState(line?.limitMonthOnly ?? false)
  const valid = Number(limit) > 0 && Number(threshold) >= 1 && Number(threshold) <= 100

  const submit = () =>
    save.mutate(
      {
        categoryId: category.id,
        monthlyLimit: Number(limit),
        alertThreshold: Number(threshold),
        ...(monthOnly ? { month, year } : { month: null, year: null }),
      },
      { onSuccess: onClose },
    )

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Límite de ${category.name}`}
      description="El bot avisa al cruzar la alerta y al pasar el 100 %."
      footer={
        <>
          {line?.budgetId && (
            <Button
              variant="ghost"
              className="mr-auto text-destructive"
              onClick={() => remove.mutate(line.budgetId as string, { onSuccess: onClose })}
            >
              Quitar límite
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!valid || save.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Límite mensual (S/)</span>
          <Input type="number" min="0" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Alerta al (%)</span>
          <Input type="number" min="1" max="100" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={monthOnly} onCheckedChange={setMonthOnly} /> Solo este mes (si no, para todos los meses)
        </label>
      </div>
    </ResponsiveDialog>
  )
}
