import type { ReactElement } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import {
  ColumnVisibilityOptions,
  type ColumnVisibilityOption,
} from "./ColumnVisibilityOptions";

export function ColumnVisibilityMenu({
  columns,
  trigger,
  align = "end",
  className = "w-52",
}: {
  columns: readonly ColumnVisibilityOption[];
  trigger: ReactElement;
  align?: "start" | "center" | "end";
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={className}>
        <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ColumnVisibilityOptions columns={columns} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
