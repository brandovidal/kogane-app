import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useDeleteIncome, useIncomes, useSaveIncome, type Income, type IncomeBody } from "@/shared/api/hooks/budget";
import { withQuery } from "@/shared/api/query";
import { EmptyState } from "@/shared/components/EmptyState";
import { DataView, useViewMode, ViewToggle, type Column } from "@/shared/components/DataView";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { CURRENCIES } from "@/shared/labels";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";
import { usePeriod } from "@/shared/stores/period.store";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const today = () => new Date().toISOString().slice(0, 10);

// Presupuesto ▸ Ingresos (D78): extras of the month (the salary is set in the header); surplus = salary + extras − spent
function IncomesPageView() {
  const month = usePeriod((s) => s.month);
  const year = usePeriod((s) => s.year);
  const { data: incomes = [], isLoading } = useIncomes(month, year);
  const deleteIncome = useDeleteIncome();
  const [editing, setEditing] = useState<Income | null | undefined>(undefined); // null: new

  const [view, setView] = useViewMode("incomes", "table");
  const totalPen = incomes.filter((income) => income.currency === "PEN").reduce((sum, income) => sum + income.amount, 0);

  const columns: Column<Income>[] = [
    { key: "date", header: "Fecha", cell: (income) => <span className="text-sm text-muted-foreground">{formatDate(income.receivedAt)}</span> },
    { key: "description", header: "Descripción", role: "title", cell: (income) => <span className="font-medium">{income.description}</span> },
    { key: "amount", header: "Monto", role: "amount", cell: (income) => <span className="font-semibold tabular-nums">{formatCurrency(income.amount, income.currency)}</span> },
    { key: "notes", header: "Nota", cell: (income) => <span className="text-sm text-muted-foreground">{income.notes ?? "—"}</span> },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[80px]",
      cell: (income) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Editar" onClick={() => setEditing(income)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" aria-label="Borrar" onClick={() => deleteIncome.mutate(income.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{incomes.length} ingresos extra</p>
          <p className="text-2xl font-bold">{formatCurrency(totalPen)}</p>
          <p className="text-xs text-muted-foreground">Se suman al sueldo en el excedente del mes.</p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <Button size="sm" onClick={() => setEditing(null)}>
            <Plus className="mr-1 h-4 w-4" /> Nuevo ingreso
          </Button>
        </div>
      </div>

      {incomes.length === 0 ? (
        <EmptyState description="No hay ingresos extra en este mes" />
      ) : (
        <DataView items={incomes} columns={columns} rowKey={(income) => income.id} view={view} />
      )}

      {editing !== undefined && <IncomeDialog income={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
}

function IncomeDialog({ income, onClose }: { income: Income | null; onClose: () => void }) {
  const saveIncome = useSaveIncome();
  const [form, setForm] = useState<IncomeBody>({
    description: income?.description ?? "",
    amount: income?.amount ?? 0,
    currency: (income?.currency as IncomeBody["currency"]) ?? "PEN",
    receivedAt: income?.receivedAt.slice(0, 10) ?? today(),
    notes: income?.notes ?? null,
  });
  const valid = form.description.trim() && form.amount > 0 && form.receivedAt;

  const save = () =>
    saveIncome.mutate(
      { id: income?.id, body: { ...form, description: form.description.trim(), notes: form.notes?.trim() || null } },
      { onSuccess: onClose },
    );

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={income ? "Editar ingreso" : "Nuevo ingreso"}
      description="Bonos, trabajos extra, ventas…"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={!valid || saveIncome.isPending}>Guardar</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-[1fr_100px] gap-2">
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Monto"
            value={form.amount || ""}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          />
          <Select value={form.currency ?? "PEN"} onValueChange={(v) => setForm({ ...form, currency: v as IncomeBody["currency"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Input type="date" value={form.receivedAt} onChange={(e) => setForm({ ...form, receivedAt: e.target.value })} />
        <Input placeholder="Nota (opcional)" value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </ResponsiveDialog>
  );
}

export const IncomesPage = withQuery(IncomesPageView);
