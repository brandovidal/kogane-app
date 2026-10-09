import { X } from "lucide-react";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/ui/sheet";
import { Switch } from "@/ui/switch";

export function DebtMovementTypeSheet({
  showCollections,
  showDebts,
  onCollectionsChange,
  onDebtsChange,
  onReset,
}: {
  showCollections: boolean;
  showDebts: boolean;
  onCollectionsChange: (checked: boolean) => void;
  onDebtsChange: (checked: boolean) => void;
  onReset: () => void;
}) {
  const activeCount = Number(!showCollections) + Number(!showDebts);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Agrupar por tipo de movimiento"
        >
          Agrupar
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(24rem,calc(100vw-1rem))] overflow-y-auto"
      >
        <SheetHeader className="px-5 pt-6">
          <SheetTitle>Tipo de movimiento</SheetTitle>
          <SheetDescription>
            Elige si el resumen incluye cobros, deudas o ambos.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-5 pb-6">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Cobros (+)</span>
            <Switch
              checked={showCollections}
              onCheckedChange={onCollectionsChange}
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Deudas (−)</span>
            <Switch checked={showDebts} onCheckedChange={onDebtsChange} />
          </label>
          <p className="text-xs text-muted-foreground">
            Activa ambos para ver el consolidado completo.
          </p>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={onReset}
            >
              <X className="mr-1 h-3.5 w-3.5" /> Restablecer tipo de movimiento
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
