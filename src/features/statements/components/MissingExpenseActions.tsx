import { MoreHorizontal, Pencil } from "lucide-react";

import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";

// ⋯ of a "Solo en Kogane" expense: it is corrected where it lives, in Tarjetas
export function MissingExpenseActions({ expenseName, onEdit }: { expenseName: string; onEdit: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Acciones de ${expenseName}`}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil /> Editar gasto en Kogane
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
