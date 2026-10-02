import { ChevronDown, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import type { DataTableCalculation } from "@/shared/types/data-table-calculation";

const labels: Record<DataTableCalculation, string> = {
  none: "Ninguno",
  count: "Contar todo",
  "count-values": "Contar valores",
  "count-unique": "Contar únicos",
  "count-empty": "Contar vacíos",
  sum: "Suma",
  average: "Promedio",
  median: "Mediana",
  min: "Mínimo",
  max: "Máximo",
  range: "Rango",
};

const shortLabels: Record<DataTableCalculation, string> = {
  none: "",
  count: "TODO",
  "count-values": "VAL",
  "count-unique": "ÚN",
  "count-empty": "VAC",
  sum: "Σ",
  average: "PROM",
  median: "MED",
  min: "MIN",
  max: "MAX",
  range: "RNG",
};

const countCalculations: DataTableCalculation[] = ["count", "count-values", "count-unique", "count-empty"];
const numberCalculations: DataTableCalculation[] = ["sum", "average", "median", "min", "max", "range"];

export function DataTableColumnCalculation({
  value,
  calculation,
  numeric,
  onChange,
  formattedValue,
  copyValue,
}: {
  value: number | null;
  calculation: DataTableCalculation;
  numeric: boolean;
  onChange: (calculation: DataTableCalculation) => void;
  formattedValue?: string;
  copyValue: string;
}) {
  const formatted = formattedValue ?? (value == null ? "—" : new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 }).format(value));

  const copyCalculation = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);
      toast.success("Cálculo copiado");
    } catch {
      toast.error("No se pudo copiar el cálculo");
    }
  };

  return (
    <div className="inline-flex max-w-full items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label={calculation === "none" ? "Elegir cálculo de columna" : `${labels[calculation]}: ${formatted}`}
            title={calculation === "none" ? "Calcular" : labels[calculation]}
            className={calculation === "none"
              ? "h-7 gap-1 px-1.5 text-xs font-normal text-muted-foreground opacity-0 transition-opacity hover:opacity-100 group-hover/calculation-cell:opacity-100 group-focus-within/calculation-cell:opacity-100 focus-visible:opacity-100"
              : "h-7 max-w-full gap-1 px-1.5 text-xs font-normal text-muted-foreground hover:text-foreground"}
          >
            {calculation === "none" ? (
              <span>Calcular</span>
            ) : (
              <span className="text-[10px] uppercase leading-none tracking-wide">{shortLabels[calculation]}</span>
            )}
            <ChevronDown aria-hidden="true" className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuRadioGroup value={calculation} onValueChange={(next) => onChange(next as DataTableCalculation)}>
            <DropdownMenuRadioItem value="none">{labels.none}</DropdownMenuRadioItem>
            <DropdownMenuSeparator />
            {countCalculations.map((option) => (
              <DropdownMenuRadioItem key={option} value={option}>{labels[option]}</DropdownMenuRadioItem>
            ))}
            {numeric && <DropdownMenuSeparator />}
            {numeric && numberCalculations.map((option) => (
              <DropdownMenuRadioItem key={option} value={option}>{labels[option]}</DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {calculation !== "none" && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          aria-label={`Copiar ${labels[calculation]}: ${copyValue}`}
          title="Copiar cálculo"
          onClick={copyCalculation}
          className="h-7 max-w-full gap-1 px-1.5 font-normal text-foreground"
        >
          <span className="truncate tabular-nums">{formatted}</span>
          <Copy aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
