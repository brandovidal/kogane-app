import { FileText, HandCoins, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { CardPeriodSelector } from "../../components/header/CardPeriodSelector";

export function CardDetailHeader({
  onNewExpense,
  onRegisterPayment,
  onEdit,
  canRegisterPayment,
}: {
  onNewExpense: () => void;
  onRegisterPayment: () => void;
  onEdit: () => void;
  canRegisterPayment: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <div className="flex w-full justify-end sm:hidden">
        <CardPeriodSelector />
      </div>
      <Button
        size="sm"
        className="card-primary-button"
        disabled={!canRegisterPayment}
        onClick={onRegisterPayment}
      >
        <HandCoins className="mr-1.5 size-4" />
        Registrar pago
      </Button>
      <Button variant="outline" size="sm" onClick={onNewExpense}>
        <Plus className="mr-1.5 size-4" />
        Nuevo gasto
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Más opciones de tarjeta"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              window.location.href = "/importacion";
            }}
          >
            <FileText className="mr-2 size-4" />
            Estados de cuenta
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onEdit}>Editar tarjeta</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
