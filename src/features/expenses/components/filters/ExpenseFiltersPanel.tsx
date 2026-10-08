import type { ReactNode } from "react";
import { Trash } from "lucide-react";
import { Button } from "@/ui/button";
import { FilterSheetShell } from "@/shared/components/filters/FilterSheetShell";
import { SheetDescription, SheetTitle } from "@/ui/sheet";

interface ExpenseFiltersPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  title?: string;
  description?: string;
  shown: number;
  total: number;
  countLabel?: string;
  compactCountInTitle?: boolean;
  count: number;
  onClear: () => void;
  children: ReactNode;
}

export function ExpenseFiltersPanel({
  open,
  onOpenChange,
  trigger,
  title = "Filtros",
  description,
  shown,
  total,
  countLabel,
  compactCountInTitle = false,
  count,
  onClear,
  children,
}: ExpenseFiltersPanelProps) {
  return (
    <FilterSheetShell
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      headerClassName="gap-2 pr-10"
      bodyClassName="space-y-3 pb-4"
      footerClassName="border-t p-4"
      header={
        <>
          <div className="flex min-w-0 items-center gap-2">
            <SheetTitle className="shrink-0">{title}</SheetTitle>
            {compactCountInTitle && countLabel && (
              <span className="truncate text-xs tabular-nums text-muted-foreground">
                {shown}/{total} registros
              </span>
            )}
          </div>
          <SheetDescription className="min-w-0">
            <span
              className="[display:-webkit-box] overflow-hidden whitespace-normal [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
              title={description}
            >
              {description ??
                "Filtra los registros y conserva tus opciones en la dirección de la página."}
            </span>
            {!compactCountInTitle && countLabel && (
              <span className="mt-1 block">
                {shown} de {total} {countLabel}
              </span>
            )}
          </SheetDescription>
        </>
      }
      footer={
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="ml-auto h-8 px-3 text-xs"
          disabled={count === 0}
          onClick={onClear}
        >
          <Trash className="mr-1 size-3.5" /> Limpiar
        </Button>
      }
    >
      <div className="flex flex-col gap-3 px-4">{children}</div>
    </FilterSheetShell>
  );
}
