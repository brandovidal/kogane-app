import { useState } from "react";

import { useCategories } from "@/shared/api/hooks/catalogs";
import {
  useCreateCommitment,
  useUpdateCommitment,
  type CommitmentBody,
  type CommitmentPatch,
} from "@/shared/api/hooks/commitments";
import type { Commitment } from "@/shared/api/types";
import { CategorySelect, PersonSelect } from "@/shared/components/CatalogSelect";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { COMMITMENT_KIND_LABELS, COMMITMENT_STATUS_LABELS, COMMITMENT_SUBTYPE_LABELS, CURRENCIES } from "@/shared/labels";
import { getMonthName } from "@/shared/lib/dates";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const SUBTYPES_BY_KIND: Record<string, string[]> = {
  loan: ["loan"],
  investment: ["land", "property", "vehicle", "stocks", "crypto", "other"],
};

const num = (value: string): number | null => (value.trim() === "" ? null : Number(value));
const text = (value: string): string | null => value.trim() || null;

interface FormState {
  name: string;
  kind: string;
  subtype: string;
  entity: string;
  currency: string;
  installmentCount: string;
  installmentAmount: string;
  dueDay: string;
  startMonth: string;
  startYear: string;
  categoryId: string | null;
  personId: string | null;
  cancellationAmount: string;
  cancellationDate: string;
  status: string;
  notes: string;
  createInstallments: boolean;
}

const stateOf = (commitment?: Commitment): FormState => ({
  name: commitment?.name ?? "",
  kind: commitment?.kind ?? "loan",
  subtype: commitment?.subtype ?? "loan",
  entity: commitment?.entity ?? "",
  currency: commitment?.currency ?? "PEN",
  installmentCount: commitment?.installmentCount?.toString() ?? "",
  installmentAmount: commitment?.installmentAmount?.toString() ?? "",
  dueDay: commitment?.dueDay?.toString() ?? "",
  startMonth: commitment?.startMonth?.toString() ?? "",
  startYear: commitment?.startYear?.toString() ?? String(new Date().getFullYear()),
  categoryId: commitment?.categoryId ?? null,
  personId: commitment?.personId ?? null,
  cancellationAmount: commitment?.cancellationAmount?.toString() ?? "",
  cancellationDate: commitment?.cancellationDate?.slice(0, 10) ?? "",
  status: commitment?.status ?? "active",
  notes: commitment?.notes ?? "",
  createInstallments: true,
});

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium">{label}</label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

// Create or edit a loan or investment (P27). With a full plan and a category the installments are created as fixed
// costs; editing the plan later does not rewrite the ones that exist
export function CommitmentForm({ commitment, onClose }: { commitment?: Commitment; onClose: () => void }) {
  const create = useCreateCommitment();
  const update = useUpdateCommitment();
  const categories = useCategories().data ?? [];
  const [form, setForm] = useState<FormState>(() => stateOf(commitment));
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  // Loans go to "Prestamo" unless another one is chosen
  const suggested = categories.find((category) => /pr[eé]stamo/i.test(category.name))?.id ?? null;
  const categoryId = form.categoryId ?? (!commitment && form.kind === "loan" ? suggested : null);

  const hasPlan = [form.installmentCount, form.installmentAmount, form.dueDay, form.startMonth, form.startYear].every((v) => v.trim() !== "");
  const valid = form.name.trim() && (!commitment && form.createInstallments && hasPlan ? !!categoryId : true);
  const pending = create.isPending || update.isPending;

  const fields = () => ({
    name: form.name.trim(),
    subtype: form.subtype as CommitmentBody["subtype"],
    entity: text(form.entity),
    currency: form.currency as CommitmentBody["currency"],
    installmentCount: num(form.installmentCount),
    installmentAmount: num(form.installmentAmount),
    dueDay: num(form.dueDay),
    startMonth: num(form.startMonth),
    startYear: form.startMonth.trim() ? num(form.startYear) : null,
    cancellationAmount: num(form.cancellationAmount),
    cancellationDate: form.cancellationDate || null,
    categoryId,
    notes: text(form.notes),
  });

  const save = () => {
    if (commitment) {
      const body: CommitmentPatch = { ...fields(), status: form.status as CommitmentPatch["status"] };
      update.mutate({ id: commitment.id, body }, { onSuccess: onClose });
      return;
    }
    const body: CommitmentBody = {
      ...fields(),
      kind: form.kind as CommitmentBody["kind"],
      ...(form.personId ? { personId: form.personId } : {}),
      createInstallments: hasPlan && form.createInstallments,
    };
    create.mutate(body, { onSuccess: onClose });
  };

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={commitment ? "Editar compromiso" : "Nuevo préstamo o inversión"}
      description="Con el plan de cuotas completo, cada cuota se crea en Costos fijos y suma al mes."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={!valid || pending}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Nombre">
          <Input placeholder="BCP, Terreno San Bartolo, Bitcoin…" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Tipo">
            <Select
              value={form.kind}
              disabled={!!commitment}
              onValueChange={(kind) => setForm((current) => ({ ...current, kind, subtype: SUBTYPES_BY_KIND[kind][0] }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(COMMITMENT_KIND_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Clase">
            <Select value={form.subtype} onValueChange={(value) => set("subtype", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(SUBTYPES_BY_KIND[form.kind] ?? []).map((value) => (
                  <SelectItem key={value} value={value}>{COMMITMENT_SUBTYPE_LABELS[value]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-[1fr_100px] gap-2">
          <Field label="Entidad" hint="Banco o vendedor">
            <Input value={form.entity} onChange={(e) => set("entity", e.target.value)} />
          </Field>
          <Field label="Moneda">
            <Select value={form.currency} onValueChange={(value) => set("currency", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <p className="pt-1 text-sm font-medium">Plan de cuotas <span className="font-normal text-muted-foreground">(vacío si no tiene cuotas)</span></p>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" min="1" placeholder="N.º de cuotas" value={form.installmentCount} onChange={(e) => set("installmentCount", e.target.value)} />
          <Input type="number" min="0" step="0.01" placeholder="Monto de cada cuota" value={form.installmentAmount} onChange={(e) => set("installmentAmount", e.target.value)} />
          <Input type="number" min="1" max="31" placeholder="Día de vencimiento" value={form.dueDay} onChange={(e) => set("dueDay", e.target.value)} />
          <div className="grid grid-cols-[1fr_80px] gap-2">
            <Select value={form.startMonth || undefined} onValueChange={(value) => set("startMonth", value)}>
              <SelectTrigger aria-label="Mes de la cuota 1"><SelectValue placeholder="Mes cuota 1" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, index) => (
                  <SelectItem key={index + 1} value={String(index + 1)}>{getMonthName(index + 1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" min="2000" max="2100" aria-label="Año de la cuota 1" value={form.startYear} onChange={(e) => set("startYear", e.target.value)} />
          </div>
        </div>
        <Field label="Categoría de las cuotas">
          <CategorySelect value={categoryId} onChange={(id) => set("categoryId", id)} placeholder="Selecciona (Prestamo, Casa…)" />
        </Field>
        {!commitment && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={hasPlan && form.createInstallments} disabled={!hasPlan} onCheckedChange={(checked) => set("createInstallments", checked === true)} />
            Crear las cuotas en Costos fijos
          </label>
        )}
        {!commitment && (
          <Field label="Persona" hint="Yo por defecto">
            <PersonSelect value={form.personId} onChange={(id) => set("personId", id)} allowEmpty />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Field label="Monto de cancelación" hint="Lo que costaría cancelarlo hoy">
            <Input type="number" min="0" step="0.01" value={form.cancellationAmount} onChange={(e) => set("cancellationAmount", e.target.value)} />
          </Field>
          <Field label="Cotizado el">
            <Input type="date" value={form.cancellationDate} onChange={(e) => set("cancellationDate", e.target.value)} />
          </Field>
        </div>
        {commitment && (
          <Field label="Estado">
            <Select value={form.status} onValueChange={(value) => set("status", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(COMMITMENT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
        <Field label="Notas">
          <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
    </ResponsiveDialog>
  );
}
