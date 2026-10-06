import { ArrowLeft, FileText, HandCoins, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { getMonthName } from "@/shared/lib/dates";
import { CardPeriodSelector } from "../../components/header/CardPeriodSelector";

export function CardDetailHeader({ name, color, movementCount, month, year, onNewExpense, onRegisterPayment, onEdit, canRegisterPayment }: {
  name: string;
  color: string | null;
  movementCount: number;
  month: number;
  year: number;
  onNewExpense: () => void;
  onRegisterPayment: () => void;
  onEdit: () => void;
  canRegisterPayment: boolean;
}) {
  return <header className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0"><a href="/tarjetas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Tarjetas</a><div className="mt-1 text-[11px] font-bold uppercase tracking-[.18em] text-brand">Tarjetas</div><div className="flex min-w-0 items-center gap-2"><span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: color ?? "#6b7280" }} /><h2 className="truncate text-xl font-semibold sm:text-2xl">Pago de tarjeta · {name}</h2></div><p className="mt-1 text-xs text-muted-foreground">{movementCount} movimientos · {getMonthName(month)} {year}</p></div>
      <div className="hidden sm:block"><CardPeriodSelector /></div>
    </div>
    <div className="flex flex-wrap justify-end gap-2">
      <a href="/importacion"><Button variant="outline" size="sm"><FileText className="mr-1.5 size-4" />Estados de cuenta</Button></a>
      <Button variant="outline" size="sm" onClick={onNewExpense}><Plus className="mr-1.5 size-4" />Nuevo gasto</Button>
      <Button size="sm" className="card-primary-button" disabled={!canRegisterPayment} onClick={onRegisterPayment}><HandCoins className="mr-1.5 size-4" />Registrar pago</Button>
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon-sm" aria-label="Más opciones de tarjeta"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={onEdit}>Editar tarjeta</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    </div>
  </header>;
}
