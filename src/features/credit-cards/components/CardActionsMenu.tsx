import {
  Archive,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Wallet,
} from "lucide-react";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import type { CardOverviewRow } from "../types/card-overview";

export interface CardActions {
  onNewExpense: (row: CardOverviewRow) => void;
  onEdit: (row: CardOverviewRow) => void;
  onArchive: (row: CardOverviewRow) => void;
}

/** ⋯ menu of a card in the overview: detail, payment, expense, statements, edit, archive. */
export function CardActionsMenu({
  row,
  actions,
}: {
  row: CardOverviewRow;
  actions: CardActions;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`Acciones de ${row.card.name}`}
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem asChild>
          <a href={row.href}>
            <Eye aria-hidden="true" /> Ver detalle
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`${row.href}&vista=pago`}>
            <Wallet aria-hidden="true" /> Registrar pago
            {row.payDay ? (
              <span className="ml-auto text-xs text-muted-foreground">
                Vence día {row.payDay}
              </span>
            ) : null}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => actions.onNewExpense(row)}>
          <Plus aria-hidden="true" /> Nuevo gasto en esta tarjeta
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/importacion">
            <FileText aria-hidden="true" /> Estados de cuenta
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => actions.onEdit(row)}>
          <Pencil aria-hidden="true" /> Editar tarjeta
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => actions.onArchive(row)}
        >
          <Archive aria-hidden="true" /> Archivar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
