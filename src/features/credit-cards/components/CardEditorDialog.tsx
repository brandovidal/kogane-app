import { useEffect, useState } from "react";
import { useCardHolders, useMe, useSaveCardHolders, useSavePaymentMethod } from "@/shared/api/hooks/catalogs";
import type { PaymentMethod } from "@/shared/api/types";
import { PersonSelect } from "@/features/settings/components/PersonSelect";
import { ResponsiveDialog } from "@/shared/components/dialogs/ResponsiveDialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";
import { toast } from "sonner";

interface FormState { name: string; code: string; bank: string; network: string; currency: "PEN" | "USD"; creditLimit: string; comment: string; last4: string; personId: string; closeDay: string; payDay: string }
const fromCard = (card?: PaymentMethod): FormState => ({ name: card?.name ?? "", code: card?.code ?? "", bank: card?.bank ?? "", network: card?.network ?? "", currency: card?.currency ?? "PEN", creditLimit: card?.creditLimit == null ? "" : String(card.creditLimit), comment: card?.comment ?? "", last4: "", personId: "", closeDay: card?.billingCloseDay == null ? "" : String(card.billingCloseDay), payDay: card?.paymentDueDay == null ? "" : String(card.paymentDueDay) });
const validDay = (value: string) => /^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 31;

export function CardEditorDialog({ card, onClose }: { card?: PaymentMethod; onClose: () => void }) {
  const [form, setForm] = useState(() => fromCard(card));
  const [submitted, setSubmitted] = useState(false);
  const [savedCardId, setSavedCardId] = useState<string | null>(null);
  const saveMethod = useSavePaymentMethod();
  const saveHolders = useSaveCardHolders();
  const me = useMe();
  const holders = useCardHolders(card?.id ?? null).data;
  useEffect(() => { if (!holders) return; const primary = holders.find((holder) => holder.role === "titular"); if (primary) setForm((previous) => ({ ...previous, personId: primary.personId, last4: primary.last4 ?? "" })); }, [holders]);
  useEffect(() => { if (!card && me) setForm((previous) => previous.personId ? previous : { ...previous, personId: me }); }, [card, me]);
  const set = (change: Partial<FormState>) => setForm((previous) => ({ ...previous, ...change }));
  const errors: Partial<Record<keyof FormState, boolean>> = { name: !form.name.trim(), code: !form.code.trim(), closeDay: !validDay(form.closeDay), payDay: !validDay(form.payDay), last4: !!form.last4 && !/^\d{4}$/.test(form.last4), personId: !form.personId, creditLimit: !!form.creditLimit && (!Number.isFinite(Number(form.creditLimit)) || Number(form.creditLimit) < 0) };
  const busy = saveMethod.isPending || saveHolders.isPending;
  const submit = async () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    try {
      const saved = await saveMethod.mutateAsync({ ...((card?.id ?? savedCardId) ? { id: card?.id ?? savedCardId! } : {}), name: form.name.trim(), type: "credit_card", code: form.code.trim().toUpperCase(), bank: form.bank.trim() || null, network: form.network.trim() || null, currency: form.currency, creditLimit: form.creditLimit ? Number(form.creditLimit) : null, comment: form.comment.trim() || null, aliases: [form.name.trim().toLowerCase()], billingCloseDay: Number(form.closeDay), paymentDueDay: Number(form.payDay) });
      setSavedCardId(saved.id);
      await saveHolders.mutateAsync({ id: saved.id, holders: [{ role: "titular", personId: form.personId, last4: form.last4 || null }, ...(holders ?? []).filter((holder) => holder.role === "additional").map((holder) => ({ role: "additional" as const, personId: holder.personId, last4: holder.last4 }))] });
      onClose();
    } catch { toast.error("No se pudo guardar la tarjeta. Revisa los datos e inténtalo otra vez."); }
  };
  const field = (name: keyof FormState, label: string, input: React.ReactNode, error?: string, helper?: string) => <div className="space-y-1.5"><label className="text-sm font-medium" htmlFor={`card-${name}`}>{label}</label>{input}{helper && <p className="text-xs text-muted-foreground">{helper}</p>}{submitted && errors[name] && <p className="text-xs text-destructive">{error}</p>}</div>;
  return <ResponsiveDialog open onOpenChange={(open) => !open && onClose()} title={card ? "Editar tarjeta" : "Nueva tarjeta"} description={card ? `Modifica los datos de ${card.name}` : "Registra una tarjeta de crédito para seguir sus cierres y pagos"} contentClassName="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-xl" footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button><Button disabled={busy} onClick={() => void submit()}>{busy ? "Guardando…" : "Guardar"}</Button></>}>
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-2 pr-1">
      {card && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">Cambiar los días de cierre o pago no modifica los movimientos ya registrados.</p>}
      {field("name", "Nombre *", <Input id="card-name" value={form.name} onChange={(event) => set({ name: event.target.value })} placeholder="Ej.: CMR" autoFocus aria-invalid={submitted && errors.name} />, "Escribe un nombre para la tarjeta")}
      <div className="grid gap-3 sm:grid-cols-2">{field("bank", "Emisor", <Input id="card-bank" value={form.bank} onChange={(event) => set({ bank: event.target.value })} placeholder="Ej.: Banco Falabella" />)}{field("code", "Código *", <Input id="card-code" value={form.code} maxLength={10} onChange={(event) => set({ code: event.target.value })} placeholder="Ej.: CMR" aria-invalid={submitted && errors.code} />, "Escribe un código corto")}</div>
      <div className="grid gap-3 sm:grid-cols-2">{field("network", "Red", <Select value={form.network || "none"} onValueChange={(network) => set({ network: network === "none" ? "" : network })}><SelectTrigger id="card-network"><SelectValue placeholder="Selecciona una red" /></SelectTrigger><SelectContent><SelectItem value="none">Sin especificar</SelectItem><SelectItem value="Visa">Visa</SelectItem><SelectItem value="Mastercard">Mastercard</SelectItem><SelectItem value="American Express">American Express</SelectItem><SelectItem value="Diners Club">Diners Club</SelectItem></SelectContent></Select>)}{field("currency", "Moneda", <Select value={form.currency} onValueChange={(currency) => set({ currency: currency as FormState["currency"] })}><SelectTrigger id="card-currency"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PEN">Soles (PEN)</SelectItem><SelectItem value="USD">Dólares (USD)</SelectItem></SelectContent></Select>)}</div>
      <div className="grid gap-3 sm:grid-cols-2">{field("last4", "Últimos 4 dígitos", <Input id="card-last4" inputMode="numeric" maxLength={4} value={form.last4} onChange={(event) => set({ last4: event.target.value.replace(/\D/g, "") })} placeholder="Ej.: 1810" aria-invalid={submitted && errors.last4} />, "Ingresa 4 dígitos", "Ayuda a identificar las compras en el estado de cuenta.")}{field("personId", "Persona *", <div id="card-personId"><PersonSelect value={form.personId || null} onChange={(personId) => set({ personId: personId ?? "" })} /></div>, "Selecciona una persona")}</div>
      {field("creditLimit", "Línea de crédito", <Input id="card-creditLimit" inputMode="decimal" value={form.creditLimit} onChange={(event) => set({ creditLimit: event.target.value })} placeholder="0.00" aria-invalid={submitted && errors.creditLimit} />, "Ingresa un monto válido")}
      <div className="grid gap-3 sm:grid-cols-2">{field("closeDay", "Día de cierre *", <Input id="card-closeDay" inputMode="numeric" value={form.closeDay} onChange={(event) => set({ closeDay: event.target.value.replace(/\D/g, "") })} placeholder="1–31" aria-invalid={submitted && errors.closeDay} />, "Ingresa un día entre 1 y 31")}{field("payDay", "Día de pago *", <Input id="card-payDay" inputMode="numeric" value={form.payDay} onChange={(event) => set({ payDay: event.target.value.replace(/\D/g, "") })} placeholder="1–31" aria-invalid={submitted && errors.payDay} />, "Ingresa un día entre 1 y 31")}</div>
      {field("comment", "Comentario", <Textarea id="card-comment" rows={3} value={form.comment} maxLength={500} onChange={(event) => set({ comment: event.target.value })} placeholder="Agrega una nota sobre esta tarjeta" />)}
    </div>
  </ResponsiveDialog>;
}
