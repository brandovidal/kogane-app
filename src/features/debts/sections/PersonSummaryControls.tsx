import { useEffect, useState } from "react";
import { Plus, SlidersHorizontal, Trash2 } from "lucide-react";

import {
  useSavePersonSummary,
  useSetPersonSummariesStatus,
} from "../hooks/personSummaries";
import type {
  PersonSummaryAdjustment,
  PersonSummaryStatus,
} from "../types/person-summary.dto";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

export const PERSON_SUMMARY_STATUS_LABELS: Record<PersonSummaryStatus, string> =
  { draft: "Borrador", in_progress: "En progreso", paid: "Pagado" };

export interface PersonSummaryData {
  status: PersonSummaryStatus;
  cutoffDate: string | null;
  collectBy: string | null;
  note: string | null;
  adjustments: PersonSummaryAdjustment[];
}

export const EMPTY_PERSON_SUMMARY: PersonSummaryData = {
  status: "draft",
  cutoffDate: null,
  collectBy: null,
  note: null,
  adjustments: [],
};

const dateOnly = (value: string | null) => (value ? value.slice(0, 10) : "");

// Status of a person's month (draft → in progress → paid) and the details that go with it
export function PersonSummaryControls({
  personId,
  name,
  month,
  year,
  summary,
}: {
  personId: string;
  name: string;
  month: number;
  year: number;
  summary: PersonSummaryData;
}) {
  const setStatus = useSetPersonSummariesStatus();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Select
        value={summary.status}
        onValueChange={(status) =>
          setStatus.mutate({
            month,
            year,
            personIds: [personId],
            status: status as PersonSummaryStatus,
          })
        }
      >
        <SelectTrigger
          size="sm"
          className="h-8 w-32 text-xs"
          aria-label={`Estado del resumen de ${name}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(
            Object.keys(PERSON_SUMMARY_STATUS_LABELS) as PersonSummaryStatus[]
          ).map((status) => (
            <SelectItem key={status} value={status}>
              {PERSON_SUMMARY_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label={`Corte, nota y ajustes de ${name}`}
        title="Corte, nota y ajustes"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="size-4" />
      </Button>
      <PersonSummaryDialog
        open={open}
        onOpenChange={setOpen}
        personId={personId}
        name={name}
        month={month}
        year={year}
        summary={summary}
      />
    </div>
  );
}

function PersonSummaryDialog({
  open,
  onOpenChange,
  personId,
  name,
  month,
  year,
  summary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  name: string;
  month: number;
  year: number;
  summary: PersonSummaryData;
}) {
  const save = useSavePersonSummary();
  const [cutoffDate, setCutoffDate] = useState("");
  const [collectBy, setCollectBy] = useState("");
  const [note, setNote] = useState("");
  const [adjustments, setAdjustments] = useState<
    { description: string; amount: string }[]
  >([]);

  useEffect(() => {
    if (!open) return;
    setCutoffDate(dateOnly(summary.cutoffDate));
    setCollectBy(dateOnly(summary.collectBy));
    setNote(summary.note ?? "");
    setAdjustments(
      summary.adjustments.map((item) => ({
        description: item.description,
        amount: String(item.amount),
      })),
    );
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- only when it opens

  const rows = adjustments.filter((item) => item.description.trim());
  const valid = rows.every((item) => Number.isFinite(Number(item.amount)));
  const patch = (index: number, next: Partial<(typeof adjustments)[number]>) =>
    setAdjustments(
      adjustments.map((item, i) => (i === index ? { ...item, ...next } : item)),
    );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Resumen de ${name}`}
      description="Fecha de corte, fecha límite de cobro, nota y ajustes manuales de este mes."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!valid || save.isPending}
            onClick={() =>
              save.mutate(
                {
                  personId,
                  body: {
                    month,
                    year,
                    cutoffDate: cutoffDate || null,
                    collectBy: collectBy || null,
                    note: note.trim() || null,
                    adjustments: rows.map((item) => ({
                      description: item.description.trim(),
                      amount: Number(item.amount),
                    })),
                  },
                },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fecha de corte</label>
            <Input
              type="date"
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Cobrar hasta</label>
            <Input
              type="date"
              value={collectBy}
              onChange={(e) => setCollectBy(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Nota</label>
          <Textarea
            value={note}
            rows={2}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Ajustes manuales</label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setAdjustments([
                  ...adjustments,
                  { description: "", amount: "" },
                ])
              }
            >
              <Plus className="mr-1 h-4 w-4" /> Agregar ajuste
            </Button>
          </div>
          {adjustments.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Descripción"
                value={item.description}
                onChange={(e) => patch(index, { description: e.target.value })}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Monto"
                className="w-28"
                value={item.amount}
                onChange={(e) => patch(index, { amount: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar ajuste"
                onClick={() =>
                  setAdjustments(adjustments.filter((_, i) => i !== index))
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Positivo: la persona debe más. Negativo: descuento a su favor.
          </p>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
