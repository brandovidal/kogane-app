import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { DraftForm } from "@/features/drafts/components/DraftForm";
import { emptyDraftFields, toDraftBody } from "@/features/drafts/draft-form";
import { ApiError } from "@/shared/api/client";
import { useCreateDraft, useExtractExpense, useSaveDraft, type DraftFields } from "@/shared/api/hooks/drafts";
import { withQuery } from "@/shared/api/query";
import { DESTINATION_LABELS } from "@/shared/labels";
import { formatCurrency } from "@/shared/lib/currency";

type Extracted = NonNullable<Awaited<ReturnType<ReturnType<typeof useExtractExpense>["mutateAsync"]>>>[number];

// Nuevo gasto (D40): the form of each destination, or a text the AI reads to prefill it. Saving goes through a draft
// and ExpenseSaverService, like the bot (D57); with fields missing it stays in Borrador.
function NewExpensePageView() {
  const [fields, setFields] = useState<DraftFields>(emptyDraftFields);
  const [text, setText] = useState("");
  const [options, setOptions] = useState<Extracted[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const extract = useExtractExpense();
  const createDraft = useCreateDraft();
  const saveDraft = useSaveDraft();

  const prefill = (expense: Extracted) => {
    setFields({
      ...emptyDraftFields(),
      destination: (expense.destination as DraftFields["destination"]) ?? "daily",
      description: expense.description,
      amount: expense.amount,
      currency: (expense.currency as DraftFields["currency"]) ?? "PEN",
      spentAt: expense.spentAt ?? emptyDraftFields().spentAt,
      expenseType: (expense.expenseType as DraftFields["expenseType"]) ?? "essential",
      installment: expense.installment,
      period: (expense.period as DraftFields["period"]) ?? null,
      personId: expense.personId,
      paymentMethodId: expense.paymentMethodId,
      categoryId: expense.categoryId,
      merchant: expense.merchant,
      operationNumber: expense.operationNumber,
      notes: expense.notes,
    });
    setMissing(expense.missingFields);
    setOptions([]);
  };

  const read = () => {
    if (!text.trim()) return;
    extract.mutate(text.trim(), {
      onSuccess: (expenses) => {
        if (!expenses?.length) return toast.info("No encontré un gasto en el texto.");
        if (expenses.length === 1) prefill(expenses[0]);
        else setOptions(expenses);
      },
    });
  };

  const save = async () => {
    try {
      const draft = await createDraft.mutateAsync(toDraftBody(fields));
      if (draft && draft.missingFields.length) {
        setMissing(draft.missingFields);
        toast.info("Faltan datos: quedó en Borrador para completarlo.");
        return;
      }
      if (draft) await saveDraft.mutateAsync(draft.id);
      setFields(emptyDraftFields());
      setText("");
      setMissing([]);
    } catch (error) {
      if (error instanceof ApiError && error.code === "EXPENSE_NOT_SAVEABLE") toast.info("Quedó en Borrador para completarlo.");
    }
  };

  const busy = createDraft.isPending || saveDraft.isPending;

  return (
    <div className="grid max-w-5xl gap-4 lg:grid-cols-[2fr_3fr]">
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" /> Escribe o pega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Ej: zapatillas 300 con io en 3 cuotas, o pega el texto de un correo del banco"
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button size="sm" className="w-full" onClick={read} disabled={!text.trim() || extract.isPending}>
            {extract.isPending ? "Leyendo..." : "Prellenar con la AI"}
          </Button>
          {options.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Encontré {options.length} gastos, elige uno:</p>
              {options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => prefill(option)}
                  className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {option.description ?? "Gasto"} · {option.amount != null ? formatCurrency(option.amount, option.currency ?? "PEN") : "sin monto"}
                  {option.destination && ` · ${DESTINATION_LABELS[option.destination] ?? option.destination}`}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Para capturas o notas de voz usa <a href="/mensajes" className="text-primary underline">Mensajes</a>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Nuevo gasto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DraftForm value={fields} onChange={setFields} missingFields={missing} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setFields(emptyDraftFields()); setMissing([]); }}>Limpiar</Button>
            <Button onClick={save} disabled={busy}>{busy ? "Guardando..." : "Guardar"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const NewExpensePage = withQuery(NewExpensePageView);
