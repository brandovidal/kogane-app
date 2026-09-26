import { useState } from "react";
import { Check, Paperclip, Pencil, Plus, Trash2 } from "lucide-react";

import {
  useCommitment,
  useCreateInstallments,
  useDeleteCommitment,
  useDeleteContribution,
  useSaveContribution,
  type ContributionBody,
} from "@/shared/api/hooks/commitments";
import { useSaveExpense } from "@/shared/api/hooks/expenses";
import type { Commitment, CommitmentInstallment, Contribution } from "@/shared/api/types";
import { AttachmentsDialog, AttachmentsPanel } from "@/shared/components/AttachmentsPanel";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { COMMITMENT_STATUS_LABELS, COMMITMENT_SUBTYPE_LABELS, CURRENCIES } from "@/shared/labels";
import { formatCurrency } from "@/shared/lib/currency";
import { formatDate, getMonthName } from "@/shared/lib/dates";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { currentLabel } from "../commitment-view";

interface CommitmentDetailProps {
  commitment: Commitment;
  onClose: () => void;
  onEdit: () => void;
}

// The installments (fixed costs), the contributions and the files of one commitment (P27)
export function CommitmentDetail({ commitment, onClose, onEdit }: CommitmentDetailProps) {
  const { data: detail } = useCommitment(commitment.id);
  const createInstallments = useCreateInstallments();
  const deleteCommitment = useDeleteCommitment();
  const money = (amount: number) => formatCurrency(amount, commitment.currency);
  const progress = detail?.progress ?? commitment.progress;
  const hasInstallments = !!commitment.installmentCount;
  const [tab, setTab] = useState(hasInstallments ? "installments" : "contributions");

  const remove = () => {
    if (!window.confirm(`¿Eliminar «${commitment.name}»? Sus cuotas siguen en Costos fijos; se borran sus aportes y archivos.`)) return;
    deleteCommitment.mutate(commitment.id, { onSuccess: onClose });
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {commitment.name}
            <Badge variant="secondary">{COMMITMENT_STATUS_LABELS[detail?.status ?? commitment.status]}</Badge>
          </SheetTitle>
          <SheetDescription>
            {commitment.entity ? `${commitment.entity} · ` : ""}
            {COMMITMENT_SUBTYPE_LABELS[commitment.subtype]}
            {progress ? ` · ${currentLabel({ ...commitment, progress })}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
            </Button>
            {progress && progress.createdCount < progress.installmentCount && (
              <Button size="sm" variant="outline" disabled={createInstallments.isPending} onClick={() => createInstallments.mutate(commitment.id)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Crear {progress.installmentCount - progress.createdCount} cuotas que faltan
              </Button>
            )}
            <Button size="sm" variant="outline" className="text-destructive" disabled={deleteCommitment.isPending} onClick={remove}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Eliminar
            </Button>
          </div>

          {commitment.cancellationAmount != null && (
            <p className="text-sm">
              Cancelarlo hoy cuesta <span className="font-semibold">{money(commitment.cancellationAmount)}</span>
              {commitment.cancellationDate && <span className="text-muted-foreground"> (cotizado el {formatDate(commitment.cancellationDate)})</span>}
            </p>
          )}
          {commitment.notes && <p className="text-sm text-muted-foreground">{commitment.notes}</p>}

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              {hasInstallments && <TabsTrigger value="installments">Cuotas</TabsTrigger>}
              {(commitment.kind === "investment" || (detail?.contributions.length ?? 0) > 0) && (
                <TabsTrigger value="contributions">Aportes</TabsTrigger>
              )}
              <TabsTrigger value="files">Archivos</TabsTrigger>
            </TabsList>

            {hasInstallments && (
              <TabsContent value="installments" className="pt-3">
                <Installments installments={detail?.installments ?? []} current={progress?.currentInstallment ?? 0} currency={commitment.currency} />
              </TabsContent>
            )}
            <TabsContent value="contributions" className="pt-3">
              <Contributions commitment={commitment} contributions={detail?.contributions ?? []} />
            </TabsContent>
            <TabsContent value="files" className="pt-3">
              <AttachmentsPanel refType="commitment" refId={commitment.id} defaultKind="contrato" />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Installments({ installments, current, currency }: { installments: CommitmentInstallment[]; current: number; currency: string }) {
  const saveExpense = useSaveExpense("fixed-costs");
  const [files, setFiles] = useState<CommitmentInstallment | null>(null);

  if (installments.length === 0) return <p className="text-sm text-muted-foreground">Todavía no hay cuotas creadas.</p>;

  return (
    <>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Cuota</th>
              <th className="px-3 py-2 font-medium">Mes</th>
              <th className="px-3 py-2 font-medium">Vence</th>
              <th className="px-3 py-2 text-right font-medium">Monto</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="w-[84px] px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {installments.map((row) => {
              const number = Number(row.installment?.split("/")[0]);
              return (
                <tr key={row.id} className={number === current ? "bg-primary/5" : undefined}>
                  <td className="px-3 py-1.5 font-medium tabular-nums">{row.installment ?? "—"}</td>
                  <td className="px-3 py-1.5">
                    {getMonthName(row.paymentMonth).slice(0, 3)} {row.paymentYear}
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">{row.dueDate ? formatDate(row.dueDate) : "—"}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{formatCurrency(row.amount, currency)}</td>
                  <td className="px-3 py-1.5">
                    <StatusBadge status={row.paymentStatus} />
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex justify-end gap-0.5">
                      {row.paymentStatus !== "paid" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label={`Marcar ${row.installment} como pagada`}
                          disabled={saveExpense.isPending}
                          onClick={() => saveExpense.mutate({ id: row.id, body: { paymentStatus: "paid" } })}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="relative h-7 w-7" aria-label={`Archivos de la cuota ${row.installment}`} onClick={() => setFiles(row)}>
                        <Paperclip className="h-3.5 w-3.5" />
                        {row.attachmentCount > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground">
                            {row.attachmentCount}
                          </span>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {files && <AttachmentsDialog title={`la cuota ${files.installment}`} refType="fixed_cost" refId={files.id} onClose={() => setFiles(null)} />}
    </>
  );
}

const today = () => new Date().toISOString().slice(0, 10);

function Contributions({ commitment, contributions }: { commitment: Commitment; contributions: Contribution[] }) {
  const remove = useDeleteContribution();
  const [editing, setEditing] = useState<Contribution | null | undefined>(undefined); // null: new
  const [files, setFiles] = useState<Contribution | null>(null);
  const total = contributions.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm">
          Total invertido: <span className="font-semibold tabular-nums">{formatCurrency(total, commitment.currency)}</span>{" "}
          <span className="text-muted-foreground">en {contributions.length} aporte(s)</span>
        </p>
        <Button size="sm" onClick={() => setEditing(null)}>
          <Plus className="mr-1 h-4 w-4" /> Nuevo aporte
        </Button>
      </div>

      {contributions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin aportes todavía: registra cada compra de acciones, bitcoin…</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {contributions.map((row) => (
            <li key={row.id} className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className="w-24 shrink-0 text-muted-foreground">{formatDate(row.date)}</span>
              <span className="font-medium tabular-nums">{formatCurrency(row.amount, row.currency)}</span>
              {row.quantity != null && (
                <span className="text-xs text-muted-foreground">
                  {row.quantity} {row.unit ?? ""}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{row.notes}</span>
              <Button variant="ghost" size="icon" className="relative h-7 w-7" aria-label="Archivos del aporte" onClick={() => setFiles(row)}>
                <Paperclip className="h-3.5 w-3.5" />
                {row.attachmentCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground">{row.attachmentCount}</span>
                )}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Editar aporte" onClick={() => setEditing(row)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                aria-label="Eliminar aporte"
                onClick={() => window.confirm("¿Eliminar este aporte y sus archivos?") && remove.mutate({ id: commitment.id, contributionId: row.id })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {editing !== undefined && <ContributionDialog commitment={commitment} contribution={editing} onClose={() => setEditing(undefined)} />}
      {files && <AttachmentsDialog title="este aporte" refType="contribution" refId={files.id} onClose={() => setFiles(null)} />}
    </div>
  );
}

function ContributionDialog({ commitment, contribution, onClose }: { commitment: Commitment; contribution: Contribution | null; onClose: () => void }) {
  const save = useSaveContribution();
  const [form, setForm] = useState({
    date: contribution?.date.slice(0, 10) ?? today(),
    amount: contribution?.amount.toString() ?? "",
    currency: contribution?.currency ?? commitment.currency,
    quantity: contribution?.quantity?.toString() ?? "",
    unit: contribution?.unit ?? "",
    notes: contribution?.notes ?? "",
  });
  const valid = form.date && Number(form.amount) > 0;

  const submit = () => {
    const body: ContributionBody = {
      date: form.date,
      amount: Number(form.amount),
      currency: form.currency as ContributionBody["currency"],
      quantity: form.quantity.trim() ? Number(form.quantity) : null,
      unit: form.unit.trim() || null,
      notes: form.notes.trim() || null,
    };
    save.mutate({ id: commitment.id, contributionId: contribution?.id, body }, { onSuccess: onClose });
  };

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={contribution ? "Editar aporte" : "Nuevo aporte"}
      description={`Lo que pusiste en ${commitment.name}.`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={!valid || save.isPending}>Guardar</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <div className="grid grid-cols-[1fr_100px] gap-2">
          <Input type="number" min="0" step="0.01" placeholder="Monto pagado" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Select value={form.currency} onValueChange={(currency) => setForm({ ...form, currency })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CURRENCIES.map((currency) => <SelectItem key={currency} value={currency}>{currency}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" min="0" step="any" placeholder="Cantidad (0.0042)" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <Input placeholder="Unidad (BTC, acciones)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        </div>
        <Input placeholder="Nota (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </ResponsiveDialog>
  );
}
