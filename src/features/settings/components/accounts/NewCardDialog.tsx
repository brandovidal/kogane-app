import { useState } from 'react'

import { useSavePaymentMethod } from '@/shared/api/hooks/catalogs'
import type { PaymentMethod } from '@/shared/api/types'
import { ResponsiveDialog } from '@/shared/components/dialogs/ResponsiveDialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Switch } from '@/ui/switch'
import { PAYMENT_METHOD_COLORS } from './constants/payment-method-form'
import { usePaymentMethodForm } from './hooks/usePaymentMethodForm'
import type { MethodType, NewCardDialogProps, PaymentMethodFormState } from './types/payment-method-form'

export function NewCardDialog({ onClose, method, defaultType = 'credit_card', catalogCards = [] }: NewCardDialogProps) {
  const save = useSavePaymentMethod()
  const { form, setForm, set, fromMethod, validDay } = usePaymentMethodForm(method, defaultType)
  const [selectedCatalog, setSelectedCatalog] = useState<PaymentMethod | null>(method ?? null)
  const [tried, setTried] = useState(false)
  const credit = form.type === 'credit_card'
  const errors = {
    name: !form.name.trim(),
    code: credit && !form.code.trim(),
    bank: !credit && form.type === 'debit_card' && !form.bank.trim(),
    billingCloseDay: credit && !validDay(form.billingCloseDay),
    paymentDueDay: credit && !validDay(form.paymentDueDay),
  }
  const submit = () => {
    setTried(true)
    if (Object.values(errors).some(Boolean)) return
    save.mutate(
      {
        ...(method || selectedCatalog ? { id: (method ?? selectedCatalog)!.id } : {}),
        name: form.name.trim(),
        type: form.type,
        code: credit ? form.code.trim().toUpperCase() || null : null,
        aliases: [...new Set([...((method ?? selectedCatalog)?.aliases ?? []), form.name.trim().toLocaleLowerCase()])],
        bank: form.bank.trim() || null,
        network: form.network.trim() || null,
        currency: form.currency,
        creditLimit: form.creditLimit ? Number(form.creditLimit) : null,
        billingCloseDay: credit ? Number(form.billingCloseDay) : null,
        paymentDueDay: credit ? Number(form.paymentDueDay) : null,
        color: form.color,
        isActive: form.isActive,
        showInBot: form.isActive && form.showInBot,
        supportsAmortization: credit && form.supportsAmortization,
        supportsCashback: credit && form.supportsCashback,
      },
      { onSuccess: onClose },
    )
  }
  const field = (name: string, label: string, child: React.ReactNode, error?: boolean, message?: string) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium" htmlFor={`method-${name}`}>
        {label}
      </label>
      {child}
      {tried && error && <p className="text-xs text-destructive">{message}</p>}
    </div>
  )
  const toggle = (key: 'isActive' | 'showInBot' | 'supportsAmortization' | 'supportsCashback', label: string, disabled = false) => (
    <label className="flex min-h-11 items-center justify-between rounded-lg border px-3 text-sm">
      {label}
      <Switch checked={form[key]} disabled={disabled} onCheckedChange={(value) => set({ [key]: value })} />
    </label>
  )

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={method ? `Editar ${method.name}` : credit ? 'Nueva tarjeta de crédito' : 'Nuevo medio de pago'}
      description={method ? 'Ajusta los datos y opciones de este medio de pago.' : 'Elige el tipo y completa los datos para agregarlo a tus cuentas.'}
      contentClassName="max-h-[90vh] overflow-y-auto sm:max-w-3xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={save.isPending}>
            {save.isPending ? 'Guardando…' : method ? 'Guardar cambios' : credit ? 'Crear tarjeta' : 'Crear medio'}
          </Button>
        </>
      }
    >
      <div className="space-y-5 py-2">
        {!method && credit && catalogCards.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">1 · Elige una base</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {catalogCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  aria-pressed={selectedCatalog?.id === card.id}
                  className={`rounded-xl border p-2 text-left transition-colors ${selectedCatalog?.id === card.id ? 'border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                  onClick={() => {
                    setSelectedCatalog(card)
                    setForm({ ...fromMethod(card), isActive: true })
                  }}
                >
                  <span
                    className="mb-2 flex h-12 items-end rounded-lg p-2 text-[10px] font-bold uppercase tracking-widest text-white"
                    style={{ background: `linear-gradient(135deg, ${card.color ?? PAYMENT_METHOD_COLORS[2]}, #101116)` }}
                  >
                    {card.code || card.name} ····
                  </span>
                  <span className="block truncate text-sm font-medium">{card.name}</span>
                  <span className="text-xs text-muted-foreground">Crédito</span>
                </button>
              ))}
              <button
                type="button"
                aria-pressed={selectedCatalog === null}
                className={`flex min-h-24 flex-col items-center justify-center rounded-xl border border-dashed p-2 text-sm ${selectedCatalog === null ? 'border-primary text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                onClick={() => {
                  setSelectedCatalog(null)
                  setForm(fromMethod(undefined, 'credit_card'))
                }}
              >
                ＋<span>Otra tarjeta</span>
                <span className="text-xs">Con tus datos</span>
              </button>
            </div>
          </div>
        )}
        {!method && !selectedCatalog && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">1 · Elige un tipo</p>
            <Select value={form.type} onValueChange={(type) => set({ type: type as MethodType })}>
              <SelectTrigger aria-label="Tipo de medio de pago">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Tarjeta de crédito</SelectItem>
                <SelectItem value="debit_card">Tarjeta de débito</SelectItem>
                <SelectItem value="wallet">Billetera</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="bank_transfer">Transferencia bancaria</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {method ? 'Datos del medio' : '2 · Completa los datos'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {field(
            'name',
            'Nombre',
            <Input
              id="method-name"
              value={form.name}
              onChange={(event) => set({ name: event.target.value })}
              placeholder={credit ? 'Ej.: CMR, Visa Oro…' : 'Ej.: Cuenta sueldo'}
            />,
            errors.name,
            'Escribe un nombre.',
          )}
          {credit &&
            field(
              'code',
              'Código corto',
              <Input
                id="method-code"
                value={form.code}
                maxLength={10}
                onChange={(event) => set({ code: event.target.value.toUpperCase() })}
                placeholder="CMR"
              />,
              errors.code,
              'Ingresa un código corto.',
            )}
          {!credit &&
            field(
              'bank',
              'Banco o emisor',
              <Input id="method-bank" value={form.bank} onChange={(event) => set({ bank: event.target.value })} placeholder="Interbank" />,
              errors.bank,
              'Ingresa el banco o emisor.',
            )}
          {credit &&
            field(
              'bank',
              'Banco o emisor',
              <Input id="method-bank" value={form.bank} onChange={(event) => set({ bank: event.target.value })} placeholder="Interbank" />,
            )}
          {field(
            'network',
            'Red',
            <Select value={form.network || 'none'} onValueChange={(network) => set({ network: network === 'none' ? '' : network })}>
              <SelectTrigger id="method-network">
                <SelectValue placeholder="Sin especificar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin especificar</SelectItem>
                <SelectItem value="Visa">Visa</SelectItem>
                <SelectItem value="Mastercard">Mastercard</SelectItem>
                <SelectItem value="American Express">American Express</SelectItem>
                <SelectItem value="Diners Club">Diners Club</SelectItem>
              </SelectContent>
            </Select>,
          )}
          {field(
            'currency',
            'Moneda',
            <Select value={form.currency} onValueChange={(currency) => set({ currency: currency as PaymentMethodFormState['currency'] })}>
              <SelectTrigger id="method-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PEN">PEN · Soles</SelectItem>
                <SelectItem value="USD">USD · Dólares</SelectItem>
              </SelectContent>
            </Select>,
          )}
          {credit &&
            field(
              'billing-close-day',
              'Día de cierre *',
              <Input
                id="method-billing-close-day"
                inputMode="numeric"
                maxLength={2}
                value={form.billingCloseDay}
                onChange={(event) => set({ billingCloseDay: event.target.value.replace(/\D/g, '') })}
                placeholder="1–31"
              />,
              errors.billingCloseDay,
              'Ingresa un día entre 1 y 31.',
            )}
          {credit &&
            field(
              'payment-due-day',
              'Día de pago *',
              <Input
                id="method-payment-due-day"
                inputMode="numeric"
                maxLength={2}
                value={form.paymentDueDay}
                onChange={(event) => set({ paymentDueDay: event.target.value.replace(/\D/g, '') })}
                placeholder="1–31"
              />,
              errors.paymentDueDay,
              'Ingresa un día entre 1 y 31.',
            )}
          {credit &&
            field(
              'limit',
              'Línea de crédito',
              <Input
                id="method-limit"
                inputMode="decimal"
                value={form.creditLimit}
                onChange={(event) => set({ creditLimit: event.target.value })}
                placeholder="S/ 0.00"
              />,
            )}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Color</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHOD_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Usar color ${color}`}
                aria-pressed={form.color === color}
                className={`size-8 rounded-full border-2 ${form.color === color ? 'border-foreground ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                onClick={() => set({ color })}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {credit && (
            <>
              {toggle('supportsAmortization', 'Amortización')}
              {toggle('supportsCashback', 'Cashback')}
            </>
          )}
          {toggle('isActive', 'La tengo')}
          {toggle('showInBot', 'En el bot', !form.isActive)}
        </div>
        {credit && !validDay(form.billingCloseDay) && (
          <p className="text-sm text-amber-400">Falta el día de cierre y de pago para activar el seguimiento de la tarjeta.</p>
        )}
      </div>
    </ResponsiveDialog>
  )
}
