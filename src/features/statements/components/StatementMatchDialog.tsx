import { Pencil, Plus } from "lucide-react";

import { useExpense } from "@/features/expenses/hooks/expenses";
import {
  nameById,
  usePaymentMethods,
  usePeople,
} from "@/shared/api/hooks/catalogs";
import {
  EXPENSE_RESOURCES,
  type Statement,
  type StatementRow,
} from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate, getMonthName } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";

export interface StatementMatchDialogProps {
  statement: Statement;
  row: StatementRow;
  onClose: () => void;
  onEdit: (id: string) => void;
  onCreate: (row: StatementRow) => void;
}

export function StatementMatchDialog({
  statement,
  row,
  onClose,
  onEdit,
  onCreate,
}: StatementMatchDialogProps) {
  const query = useExpense(
    EXPENSE_RESOURCES.creditCard,
    row.expenseId ?? undefined,
  );
  const expense = query.data;
  const personName = nameById(usePeople().data);
  const cardName = nameById(usePaymentMethods().data);
  const period = (month: number, year: number) =>
    `${getMonthName(month)} ${year}`;
  const otherPeriod =
    expense &&
    (expense.paymentMonth !== statement.paymentMonth ||
      expense.paymentYear !== statement.paymentYear);
  const comparisons = expense
    ? [
        {
          label: "Descripción",
          pdf: row.description,
          saved: expense.description,
        },
        {
          label: "Monto",
          pdf: formatCurrency(row.amount, row.currency),
          saved: formatCurrency(expense.amount, expense.currency),
        },
        {
          label: "Fecha de compra",
          pdf: row.date ? formatDate(row.date) : "—",
          saved: expense.processDate ? formatDate(expense.processDate) : "—",
        },
        {
          label: "Cuota",
          pdf: row.installment ?? "—",
          saved: expense.installment ?? "—",
        },
        {
          label: "Mes de pago",
          pdf: period(statement.paymentMonth, statement.paymentYear),
          saved: period(expense.paymentMonth, expense.paymentYear),
        },
        {
          label: "Tarjeta",
          pdf: statement.cardName,
          saved: cardName(expense.paymentMethodId),
        },
        {
          label: "Persona",
          pdf: personName(row.personId),
          saved: personName(expense.personId),
        },
      ]
    : [];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {row.result === "created"
              ? "Registro creado desde el estado"
              : "Revisar coincidencia"}
          </DialogTitle>
          <DialogDescription>
            Compara el movimiento del PDF con el gasto vinculado en Kogane antes
            de editarlo o crear otro. La fecha de compra y el mes de pago pueden
            ser distintos.
          </DialogDescription>
        </DialogHeader>
        {query.isPending && (
          <p className="text-sm text-muted-foreground">
            Cargando el gasto vinculado…
          </p>
        )}
        {query.isError && (
          <div className="space-y-2" role="alert">
            <p className="text-sm text-destructive">
              No se pudo cargar el gasto vinculado.
            </p>
            <Button variant="outline" onClick={() => query.refetch()}>
              Reintentar
            </Button>
          </div>
        )}
        {expense && (
          <>
            {otherPeriod && (
              <p
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm"
                role="status"
              >
                El gasto de Kogane pertenece a{" "}
                {period(expense.paymentMonth, expense.paymentYear)}; el estado
                corresponde a{" "}
                {period(statement.paymentMonth, statement.paymentYear)}. Revisa
                el mes y la cuota antes de crear otro gasto.
              </p>
            )}
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campo</TableHead>
                    <TableHead>Estado de cuenta</TableHead>
                    <TableHead>En Kogane</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisons.map((item) => (
                    <TableRow key={item.label}>
                      <TableCell className="text-muted-foreground">
                        {item.label}
                      </TableCell>
                      <TableCell className="min-w-36 whitespace-normal wrap-break-word">
                        {item.pdf}
                      </TableCell>
                      <TableCell className="min-w-36 whitespace-normal wrap-break-word">
                        {item.saved}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">
              Editar el gasto actualiza el registro existente. Crear otro
              mantiene el gasto vinculado y añade uno nuevo tras confirmar.
            </p>
          </>
        )}
        <DialogFooter className="flex-wrap">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {expense && row.result === "matched" && (
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onCreate(row);
              }}
            >
              <Plus aria-hidden="true" /> Crear otro gasto…
            </Button>
          )}
          {expense && (
            <Button
              onClick={() => {
                onClose();
                onEdit(expense.id);
              }}
            >
              <Pencil aria-hidden="true" /> Editar gasto en Kogane
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
