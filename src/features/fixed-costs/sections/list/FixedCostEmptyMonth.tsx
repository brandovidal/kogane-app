import { CalendarPlus, ChevronLeft, Plus } from "lucide-react";
import { getMonthName } from "@/shared/lib/dates";
import { Button } from "@/ui/button";

/**
 * Empty month: explains that nothing was registered and offers the two usual next
 * steps, going back to the previous month (to duplicate or move its costs from the
 * row menu) or creating one from scratch.
 */
export function FixedCostEmptyMonth({
  month,
  year,
  onCreate,
  onGoTo,
}: {
  month: number;
  year: number;
  onCreate: () => void;
  onGoTo: (month: number, year: number) => void;
}) {
  const previousIndex = year * 12 + month - 2;
  const previousMonth = (previousIndex % 12) + 1;
  const previousYear = Math.floor(previousIndex / 12);
  return (
    <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10 text-brand">
        <CalendarPlus className="size-6" />
      </span>
      <p className="eyebrow">Sin registros</p>
      <h2 className="text-xl font-semibold tracking-tight">
        Aún no hay costos fijos en {getMonthName(month).toLowerCase()} {year}
      </h2>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">
        Puedes revisar {getMonthName(previousMonth).toLowerCase()} y usar «Duplicar» o «Transferir» en cada fila para
        traerlos a este mes, o crear uno nuevo.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" onClick={() => onGoTo(previousMonth, previousYear)}>
          <ChevronLeft className="size-4" />
          Ver {getMonthName(previousMonth).toLowerCase()} {previousYear}
        </Button>
        <Button type="button" onClick={onCreate}>
          <Plus className="size-4" />
          Crear costo fijo
        </Button>
      </div>
    </section>
  );
}
