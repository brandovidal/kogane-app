import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  CalendarClock,
  MonitorPlay,
  PanelsTopLeft,
  ReceiptText,
  Repeat2,
  Tags,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { previewMoveSeries } from "../../services/expense.service";
import {
  useMoveSeries,
  type MoveSeries,
} from "@/features/expenses/hooks/expenses";
import { CategorySelect } from "@/features/categories/components/CategorySelect";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { FieldLabel } from "@/shared/components/forms/FieldLabel";
import { getMonthName } from "@/shared/lib/dates";
import { SUBSCRIPTION_KIND_LABELS } from "@/features/subscriptions/constants/subscriptions";
import { Button } from "@/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

type Movable = "fixed-costs" | "subscriptions";

export interface MoveSource {
  resource: Movable;
  id: string;
  description: string;
  kind?: string; // subscriptions only
}

interface Destination {
  key: string;
  label: string;
  to: Movable;
  kind?: MoveSeries["kind"];
  Icon: LucideIcon;
}

// Where a row can go (D106): the other table, or another kind of subscription
const DESTINATIONS: Destination[] = [
  { key: "fixed", label: "Costos fijos", to: "fixed-costs", Icon: ReceiptText },
  {
    key: "platform",
    label: "Plataformas",
    to: "subscriptions",
    kind: "platform",
    Icon: MonitorPlay,
  },
  ...(["service", "annual", "other"] as const).map((kind) => ({
    key: kind,
    label: `Recurrentes · ${SUBSCRIPTION_KIND_LABELS[kind]}`,
    to: "subscriptions" as const,
    kind,
    Icon: { service: Zap, annual: CalendarClock, other: Repeat2 }[kind],
  })),
];

const monthLabel = (period: { month: number; year: number } | null) =>
  period
    ? `${getMonthName(period.month).slice(0, 3).toLowerCase()} ${period.year}`
    : "";

// "Transferir a otra sección" of the ⋯ menu: moves the whole series (same description and person) and its template, after showing
// how many rows it is
export function MoveSeriesDialog({
  source,
  onClose,
}: {
  source: MoveSource;
  onClose: () => void;
}) {
  const options = DESTINATIONS.filter((option) =>
    source.resource === "fixed-costs"
      ? option.to !== "fixed-costs"
      : option.kind !== source.kind,
  );
  const [key, setKey] = useState(options[0].key);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const destination =
    options.find((option) => option.key === key) ?? options[0];
  const body = {
    resource: source.resource,
    id: source.id,
    to: destination.to,
    kind: destination.kind,
  };
  const move = useMoveSeries();

  const preview = useQuery({
    queryKey: ["expense-moves", source.resource, source.id, destination.key],
    queryFn: () => previewMoveSeries(body),
  });
  const series = preview.data;
  const needsCategory = !!series?.withoutCategory;
  const blocked = !!series?.blocked.length;

  const confirm = () =>
    move.mutate(
      { ...body, ...(needsCategory && categoryId ? { categoryId } : {}) },
      {
        onSuccess: (moved) => {
          toast.success(
            `${moved.count} ${moved.count === 1 ? "fila pasó" : "filas pasaron"} a ${destination.label}`,
          );
          onClose();
        },
      },
    );

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Transferir «${source.description}»`}
      icon={
        <ArrowRightLeft aria-hidden="true" className="size-4 text-primary" />
      }
      description="Se mueve toda la serie (misma descripción y persona) con su plantilla, su reparto y sus archivos."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={confirm}
            disabled={
              !series ||
              blocked ||
              (needsCategory && !categoryId) ||
              move.isPending
            }
          >
            <ArrowRightLeft aria-hidden="true" />
            Transferir
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            <FieldLabel icon={PanelsTopLeft}>Sección de destino</FieldLabel>
          </label>
          <Select value={key} onValueChange={setKey}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  <span className="inline-flex items-center gap-2">
                    <option.Icon
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {series && (
          <p className="text-sm">
            Se{" "}
            {series.count === 1
              ? "moverá 1 fila"
              : `moverán ${series.count} filas`}
            {series.from && series.until && series.count > 1
              ? ` (${monthLabel(series.from)} – ${monthLabel(series.until)})`
              : series.from
                ? ` (${monthLabel(series.from)})`
                : ""}
            {series.templates
              ? ` y ${series.templates === 1 ? "su plantilla" : `${series.templates} plantillas`}`
              : ""}
            .
          </p>
        )}

        {needsCategory && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              <FieldLabel icon={Tags}>Categoría *</FieldLabel>
            </label>
            <CategorySelect value={categoryId} onChange={setCategoryId} />
            <p className="text-xs text-muted-foreground">
              {series?.withoutCategory}{" "}
              {series?.withoutCategory === 1
                ? "fila no tiene"
                : "filas no tienen"}{" "}
              categoría y en Costos fijos es obligatoria.
            </p>
          </div>
        )}

        {blocked && (
          <p className="text-sm text-destructive">
            {series?.blocked.map((row) => monthLabel(row)).join(", ")}{" "}
            {series?.blocked.length === 1 ? "tiene" : "tienen"} una edición
            abierta en el bot (/editar): termínala o cancélala antes de moverla.
          </p>
        )}
      </div>
    </ResponsiveDialog>
  );
}
