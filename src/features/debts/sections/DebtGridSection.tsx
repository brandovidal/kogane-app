import { useState } from "react";
import { HistoryDialog } from "@/features/history/components/HistoryDialog";
import { ChevronRight, Eye, HandCoins, History, MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useDeleteDebt, useBulkDebts } from "@/shared/api/hooks/debts";
import type { Debt } from "@/shared/api/types";
import { DataView, type Column, type ViewMode } from "@/shared/components/DataView";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { DEBT_TIMING_LABELS } from "@/shared/labels";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/ui/alert-dialog";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Progress } from "@/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { debtBadgeStatus, groupByPersonAndType } from "../debt-filters";

export function DebtGridSection({
  debts,
  view,
  onPay,
  onEdit,
  selected,
  onSelectedChange,
  groupTypes = false,
  cardNames = new Map(),
}: {
  debts: Debt[];
  view: ViewMode;
  onPay: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  selected: Set<string>;
  onSelectedChange: (selected: Set<string>) => void;
  groupTypes?: boolean;
  cardNames?: Map<string, string>;
}) {
  const deleteDebt = useDeleteDebt();
  const [deleting, setDeleting] = useState<Debt | null>(null);
  const [resetting, setResetting] = useState<Debt | null>(null);
  const [historyOf, setHistoryOf] = useState<Debt | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const columns: Column<Debt>[] = [
    {
      key: "concept",
      header: "Concepto",
      role: "title",
      cell: (debt) => (
        <div>
          <span className="font-medium">
            {debt.description}
            {debt.installment && (
              <Badge variant="outline" className="ml-2 text-xs">
                {debt.installment}
              </Badge>
            )}
          </span>
          {debt.notes && (
            <p className="text-xs italic text-muted-foreground">{debt.notes}</p>
          )}
        </div>
      ),
    },
    {
      key: "balance",
      header: "Saldo",
      role: "amount",
      cell: (debt) => {
        const progress =
          debt.amount > 0 ? (debt.paidAmount / debt.amount) * 100 : 0;
        return (
          <div className="min-w-35 space-y-1">
            <span className="font-semibold tabular-nums">
              {formatCurrency(debt.balance)}
            </span>
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              Pagado {formatCurrency(debt.paidAmount)} de{" "}
              {formatCurrency(debt.amount)}
            </p>
          </div>
        );
      },
    },
    {
      key: "person",
      header: "Persona",
      cell: (debt) => <span className="text-sm">{debt.person.name}</span>,
    },
    {
      key: "month",
      header: "Mes de pago",
      cell: (debt) => (
        <span className="text-sm text-muted-foreground">
          {getMonthName(debt.paymentMonth)} {debt.paymentYear}
        </span>
      ),
    },
    {
      key: "state",
      header: "Estado",
      cell: (debt) => (
        <span className="inline-flex items-center gap-1">
          <StatusBadge status={debtBadgeStatus(debt.status)} />
          {debt.balance > 0 && debt.timing === "late" && (
            <StatusBadge status="late" label={DEBT_TIMING_LABELS.late} />
          )}
          {debt.balance > 0 && debt.timing === "upcoming" && (
            <StatusBadge status="not_started" label={DEBT_TIMING_LABELS.upcoming} />
          )}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      role: "actions",
      className: "w-[50px]",
      cell: (debt) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label={`Acciones de ${debt.description}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <a href={`/detalle-deuda?id=${encodeURIComponent(debt.id)}&from=${debt.direction === "owed_to_me" ? "cobros" : "deudas"}`}><Eye /> Ver detalle</a>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEdit(debt)}>
              <Pencil /> Editar datos
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onPay(debt)}
              disabled={debt.balance <= 0}
            >
              <HandCoins /> Registrar pago
            </DropdownMenuItem>
            {debt.status !== "pending" && (
              <DropdownMenuItem onSelect={() => setResetting(debt)}>
                <RotateCcw /> Corregir estado
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => setHistoryOf(debt)}>
              <History /> Historial
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeleting(debt)}
            >
              <Trash2 /> Borrar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  if (groupTypes) {
    const groups = groupByPersonAndType(debts, cardNames);
    const ownDebts = groups.find((group) => group.type === "Deuda propia")?.debts ?? [];
    const summaries = groups.filter((group) => group.type !== "Deuda propia");
    const toggleGroup = (key: string) => setExpandedGroups((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    const toggleSelection = (items: Debt[], checked: boolean) => {
      const next = new Set(selected);
      items.forEach((item) => checked ? next.add(item.id) : next.delete(item.id));
      onSelectedChange(next);
    };
    const renderDebtRow = (debt: Debt) => (
      <TableRow key={debt.id} data-state={selected.has(debt.id) ? "selected" : undefined}>
        <TableCell><Checkbox aria-label={`Seleccionar ${debt.description}`} checked={selected.has(debt.id)} onCheckedChange={(checked) => toggleSelection([debt], checked === true)} /></TableCell>
        {columns.map((column) => <TableCell key={column.key} className={column.className}>{column.cell(debt)}</TableCell>)}
      </TableRow>
    );
    return (
      <>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-9"><Checkbox aria-label="Seleccionar todas las deudas de la persona" checked={debts.length > 0 && debts.every((debt) => selected.has(debt.id)) ? true : debts.some((debt) => selected.has(debt.id)) ? "indeterminate" : false} onCheckedChange={(checked) => toggleSelection(debts, checked === true)} /></TableHead>
              {columns.map((column) => <TableHead key={column.key} className={column.className}>{column.role === "actions" ? "" : column.header}</TableHead>)}
            </TableRow></TableHeader>
            <TableBody>
              {ownDebts.map(renderDebtRow)}
              {summaries.map((group) => {
                const isPlatform = group.type === "Plataformas";
                const title = /cmr|falabella/i.test(group.type) ? "CMR (Falabella)" : isPlatform ? "Plataformas · Stream" : group.type;
                const expanded = expandedGroups.has(group.key);
                const allSelected = group.debts.every((debt) => selected.has(debt.id));
                const someSelected = group.debts.some((debt) => selected.has(debt.id));
                return <>
                  <TableRow key={`${group.key}:summary`} className="bg-muted/30">
                    <TableCell><Checkbox aria-label={`Seleccionar ${title}`} checked={allSelected ? true : someSelected ? "indeterminate" : false} onCheckedChange={(checked) => toggleSelection(group.debts, checked === true)} /></TableCell>
                    {columns.map((column) => <TableCell key={column.key} className={column.className}>
                      {column.role === "title" ? <button type="button" className="flex items-center gap-2 text-left font-medium" aria-expanded={expanded} onClick={() => toggleGroup(group.key)}><ChevronRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />{title}<Badge variant="outline" className="text-xs">{group.debts.length}</Badge></button>
                        : column.role === "amount" ? <div className="font-semibold tabular-nums">{formatCurrency(group.total)}<p className="text-xs font-normal text-muted-foreground">Saldo conjunto</p></div>
                          : column.role === "actions" ? null
                            : column.key === "person" ? <span className="text-sm">{group.name}</span>
                              : <span className="text-muted-foreground">—</span>}
                    </TableCell>)}
                  </TableRow>
                  {expanded && group.debts.map(renderDebtRow)}
                </>;
              })}
            </TableBody>
          </Table>
        </div>
        <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
          <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Borrar «{deleting?.description}»?</AlertDialogTitle><AlertDialogDescription>{deleting && deleting.paidAmount > 0 ? `Tiene ${formatCurrency(deleting.paidAmount)} pagados: se borran con ella. No se puede deshacer.` : "No se puede deshacer."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleting && deleteDebt.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}>Borrar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>
        <ResetDebtDialog debt={resetting} onClose={() => setResetting(null)} />
        {historyOf && <HistoryDialog title={historyOf.description} entity="exp_debts" id={historyOf.id} onClose={() => setHistoryOf(null)} />}
      </>
    );
  }
  return (
    <>
      <DataView
        items={debts}
        columns={columns}
        rowKey={(debt) => debt.id}
        view={view}
        selected={selected}
        onSelectedChange={onSelectedChange}
      />
      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Borrar «{deleting?.description}»?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && deleting.paidAmount > 0
                ? `Tiene ${formatCurrency(deleting.paidAmount)} pagados: se borran con ella. No se puede deshacer.`
                : "No se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleting &&
                deleteDebt.mutate(deleting.id, {
                  onSuccess: () => setDeleting(null),
                })
              }
            >
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ResetDebtDialog debt={resetting} onClose={() => setResetting(null)} />
      {historyOf && <HistoryDialog title={historyOf.description} entity="exp_debts" id={historyOf.id} onClose={() => setHistoryOf(null)} />}
    </>
  );
}

export function ResetDebtDialog({ debt, onClose }: { debt: Debt | null; onClose: () => void }) {
  const resetDebt = useBulkDebts();
  return (
    <AlertDialog open={!!debt} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Volver «{debt?.description}» a No iniciado?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminarán los pagos registrados de esta cuota y el saldo volverá al total. Puedes registrar el pago correcto después.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={resetDebt.isPending}
            onClick={() => debt && resetDebt.mutate({ ids: [debt.id], action: "reset" }, { onSuccess: onClose })}
          >
            Volver a No iniciado
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
