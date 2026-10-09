import {
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/ui/dropdown-menu";

export interface ColumnVisibilityOption {
  id: string;
  label: string;
  visible: boolean;
  disabled?: boolean;
  onVisibleChange: (visible: boolean) => void;
}

export function ColumnVisibilityOptions({
  columns,
  className,
}: {
  columns: readonly ColumnVisibilityOption[];
  className?: string;
}) {
  const visibleCount = columns.filter((column) => column.visible).length;

  return (
    <>
      {columns.map((column) => (
        <DropdownMenuCheckboxItem
          key={column.id}
          checked={column.visible}
          disabled={column.disabled}
          onSelect={(event) => event.preventDefault()}
          onCheckedChange={column.onVisibleChange}
          className={className}
        >
          {column.label}
        </DropdownMenuCheckboxItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem
        checked={visibleCount === columns.length}
        onSelect={(event) => event.preventDefault()}
        onCheckedChange={() =>
          columns.forEach((column) => column.onVisibleChange(true))
        }
        className={className}
      >
        Mostrar todas
      </DropdownMenuCheckboxItem>
    </>
  );
}
