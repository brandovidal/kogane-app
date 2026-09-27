import { formatCurrency } from "@/shared/lib/currency";
import { getMonthName } from "@/shared/lib/dates";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

type DebtSummaryMonthRow = {
  name: string;
  month: number;
  year: number;
  owed: number;
  owe: number;
  concept: string;
};

export function DebtSummaryMonthlyTable({
  rows,
  recordCount,
  totalToCollect,
  totalToPay,
  netTotal,
}: {
  rows: DebtSummaryMonthRow[];
  recordCount: number;
  totalToCollect: number;
  totalToPay: number;
  netTotal: number;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Persona</TableHead>
            <TableHead>Mes / concepto</TableHead>
            <TableHead className="text-right">Me debe</TableHead>
            <TableHead className="text-right">Le debo</TableHead>
            <TableHead className="text-right text-violet-200">Por cobrar / pagar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.name}-${row.year}-${row.month}-${row.concept}`}>
              <TableCell>{row.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {row.concept || `${getMonthName(row.month)} ${row.year}`}
              </TableCell>
              <TableCell className="text-right tabular-nums text-amber-300">{formatCurrency(row.owed)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency(row.owe)}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-violet-200">{formatCurrency(row.owed - row.owe)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="border-t-2 bg-muted/20 font-semibold">
            <TableCell>Total registros · {recordCount}</TableCell>
            <TableCell className="text-muted-foreground">Todos los periodos</TableCell>
            <TableCell className="text-right font-semibold tabular-nums text-amber-300">{formatCurrency(totalToCollect)}</TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency(totalToPay)}</TableCell>
            <TableCell className="text-right font-bold tabular-nums text-violet-200">{formatCurrency(netTotal)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
