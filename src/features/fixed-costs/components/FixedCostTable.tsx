import { useState } from "react";
import { useCategories, usePaymentMethods, usePeople, nameById } from "@/shared/api/hooks/catalogs";
import { useDeleteExpense, useExpenses, useSaveExpense } from "@/shared/api/hooks/expenses";
import { withQuery } from "@/shared/api/query";
import { EXPENSE_RESOURCES, type FixedCost } from "@/shared/api/types";
import { usePeriod } from "@/shared/stores/period.store";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { CurrencyDisplay } from "@/shared/components/CurrencyDisplay";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Input } from "@/ui/input";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { formatDate } from "@/shared/lib/dates";
import { FIXED_COST_STATUSES as PAYMENT_STATUSES, PAYMENT_STATUS_LABELS } from "@/shared/labels";
import { InlineAddRow } from "@/shared/components/InlineAddRow";
import { FixedCostDialog } from "./FixedCostDialog";

function FixedCostTableView() {
  const selectedMonth = usePeriod((s) => s.month);
  const selectedYear = usePeriod((s) => s.year);
  const fixedCosts =
    useExpenses(EXPENSE_RESOURCES.fixedCost, { month: selectedMonth, year: selectedYear }).data ?? [];
  const categories = useCategories().data ?? [];
  const people = usePeople().data ?? [];
  const personName = nameById(people);
  const accountName = nameById(usePaymentMethods().data);
  const saveFixedCost = useSaveExpense(EXPENSE_RESOURCES.fixedCost);
  const deleteFixedCost = useDeleteExpense(EXPENSE_RESOURCES.fixedCost);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedCost | undefined>();

  const filtered = fixedCosts
    .filter((fc) => !search || fc.description.toLowerCase().includes(search.toLowerCase()))
    .filter((fc) => statusFilter === "all" || fc.paymentStatus === statusFilter)
    .filter((fc) => categoryFilter === "all" || fc.categoryId === categoryFilter);

  const total = filtered.reduce((sum, fc) => sum + (fc.amountInPen ?? fc.amount), 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {PAYMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => { setEditingItem(undefined); setDialogOpen(true); }}>
          <Plus className="mr-1 h-4 w-4" /> Nuevo gasto
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState description="No hay costos fijos con los filtros seleccionados" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Persona</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((fc) => {
                const cat = categories.find((c) => c.id === fc.categoryId);
                return (
                  <TableRow key={fc.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{fc.description}</span>
                        {fc.installment && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {fc.installment}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cat && (
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-sm">{cat.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <CurrencyDisplay amount={fc.amount} currency={fc.currency} amountInPEN={fc.amountInPen} />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={fc.paymentStatus}
                        onValueChange={(val) => saveFixedCost.mutate({ id: fc.id, body: { paymentStatus: val } })}
                      >
                        <SelectTrigger className="h-7 w-auto border-0 p-0">
                          <StatusBadge status={fc.paymentStatus} />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm">{personName(fc.personId)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fc.dueDate ? formatDate(fc.dueDate) : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{accountName(fc.paymentMethodId)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingItem(fc); setDialogOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteFixedCost.mutate(fc.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              <InlineAddRow
                totalColumns={8}
                columns={[
                  { key: "description", placeholder: "Descripción...", type: "text" },
                  { key: "categoryId", placeholder: "Categoría", type: "select", options: categories.map((c) => ({ value: c.id, label: c.name })) },
                  { key: "amount", placeholder: "Monto", type: "number" },
                  { key: "personId", placeholder: "Persona", type: "select", options: people.map((p) => ({ value: p.id, label: p.name })) },
                ]}
                onSave={(values) => {
                  saveFixedCost.mutate({
                    body: {
                      description: values.description,
                      amount: Number(values.amount),
                      currency: "PEN",
                      categoryId: values.categoryId,
                      personId: values.personId,
                      paymentMonth: selectedMonth,
                      paymentYear: selectedYear,
                    },
                  });
                }}
              />
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-sm text-muted-foreground">{filtered.length} registros</span>
            <span className="text-sm font-semibold">Total: S/ {total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <FixedCostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fixedCost={editingItem}
      />
    </div>
  );
}

export const FixedCostTable = withQuery(FixedCostTableView);
