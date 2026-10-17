import { useState } from 'react'
import { NotebookPen, ReceiptText, UsersRound } from 'lucide-react'

import { CategorySelect } from '@/features/categories/components/CategorySelect'
import { PaymentMethodSelect } from '@/features/settings/components/payment-methods/PaymentMethodSelect'
import { PersonSelect } from '@/features/settings/components/people/PersonSelect'
import { FormField } from '@/shared/components/forms/FormField'
import { CURRENCIES } from '@/shared/constants/finance'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import type { DraftFields } from '../hooks/drafts'
import { ShareEditor } from './ShareEditor'
import { PendingAttachmentsPanel } from '@/features/attachments/components/PendingAttachmentsPanel'
import type { PendingAttachmentUpload } from '@/features/attachments/types/pending-attachment-upload'

export function DailyDraftTabs({
  value,
  onChange,
  missingFields = [],
  files,
  onFilesChange,
}: {
  value: DraftFields
  onChange: (value: DraftFields) => void
  missingFields?: string[]
  files: PendingAttachmentUpload[]
  onFilesChange: (files: PendingAttachmentUpload[]) => void
}) {
  const [tab, setTab] = useState('general')
  const set = <K extends keyof DraftFields>(key: K, next: DraftFields[K]) => onChange({ ...value, [key]: next })
  const missing = (field: string) => missingFields.includes(field)
  const currency = value.currency ?? 'PEN'

  return (
    <Tabs value={tab} onValueChange={setTab} className="min-w-0">
      <TabsList className="grid h-11 w-full grid-cols-3">
        <TabsTrigger value="general" className="gap-2">
          <ReceiptText className="size-4" /> General
        </TabsTrigger>
        <TabsTrigger value="sharing" className="gap-2">
          <UsersRound className="size-4" /> Reparto
        </TabsTrigger>
        <TabsTrigger value="notes" className="gap-2">
          <NotebookPen className="size-4" /> Notas y archivos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4 pt-3">
        <section className="space-y-4 rounded-2xl border p-4 sm:p-5">
          <FormField label="Descripción *" missing={missing('description')} error={missing('description') ? 'Escribe una descripción' : undefined}>
            <Input
              autoFocus
              value={value.description ?? ''}
              onChange={(event) => set('description', event.target.value)}
              placeholder="Ej: Almuerzo, taxi, supermercado…"
            />
          </FormField>

          <FormField label="Monto *" missing={missing('amount')} error={missing('amount') ? 'Ingresa un monto mayor a 0' : undefined}>
            <div className="flex h-11 overflow-hidden rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring/50">
              <span className="flex items-center border-r px-4 text-sm text-muted-foreground">{currency === 'USD' ? 'US$' : 'S/'}</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={value.amount ?? ''}
                onChange={(event) => set('amount', event.target.value === '' ? null : Number(event.target.value))}
                className="h-full min-w-0 flex-1 rounded-none border-0 text-base shadow-none focus-visible:ring-0"
                placeholder="0.00"
              />
              <Select value={currency} onValueChange={(next) => set('currency', next as DraftFields['currency'])}>
                <SelectTrigger className="h-full w-24 rounded-none border-0 border-l shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormField>
        </section>

        <section className="grid gap-4 rounded-2xl border p-4 sm:grid-cols-2 sm:p-5">
          <FormField label="Fecha *" missing={missing('spentAt')} error={missing('spentAt') ? 'Elige una fecha' : undefined}>
            <Input type="date" value={value.spentAt?.slice(0, 10) ?? ''} onChange={(event) => set('spentAt', event.target.value || null)} />
            <p className="text-xs text-muted-foreground">Fecha del gasto</p>
          </FormField>
          <FormField label="Para quién *" missing={missing('personId')} error={missing('personId') ? 'Elige una persona' : undefined}>
            <PersonSelect value={value.personId} onChange={(id) => set('personId', id)} />
            <p className="text-xs text-muted-foreground">Por defecto: tú</p>
          </FormField>
          <FormField
            label="Medio de pago *"
            missing={missing('paymentMethodId')}
            error={missing('paymentMethodId') ? 'Elige cómo pagaste' : undefined}
          >
            <PaymentMethodSelect allowEmpty value={value.paymentMethodId} onChange={(id) => set('paymentMethodId', id)} />
          </FormField>
          <FormField label="Categoría" missing={missing('categoryId')}>
            <CategorySelect allowEmpty value={value.categoryId} onChange={(id) => set('categoryId', id)} />
          </FormField>
        </section>
      </TabsContent>

      <TabsContent value="sharing" className="pt-3">
        <div className="rounded-2xl border p-4 sm:p-5">
          <ShareEditor value={value.sharedWith} total={value.amount} currency={currency} onChange={(sharedWith) => set('sharedWith', sharedWith)} />
        </div>
      </TabsContent>

      <TabsContent value="notes" className="space-y-4 pt-3">
        <section className="space-y-4 rounded-2xl border p-4 sm:p-5">
          <FormField label="Nota">
            <Textarea
              value={value.notes ?? ''}
              onChange={(event) => set('notes', event.target.value)}
              placeholder="Agrega un detalle que quieras recordar…"
              rows={4}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Comercio">
              <Input value={value.merchant ?? ''} onChange={(event) => set('merchant', event.target.value)} placeholder="Opcional" />
            </FormField>
            <FormField label="N.º de operación">
              <Input value={value.operationNumber ?? ''} onChange={(event) => set('operationNumber', event.target.value)} placeholder="Opcional" />
            </FormField>
          </div>
          <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            <h3 className="mb-2 font-medium text-foreground">Archivos</h3>
            <p className="mb-3">Boleta, captura de Yape u otro comprobante</p>
            <PendingAttachmentsPanel files={files} onChange={onFilesChange} dropzone kind="boleta" showKindSelect={false} />
            <p className="mt-3">
              ¿Tienes una captura, un audio o un texto? Usa{' '}
              <Button asChild variant="link" className="h-auto p-0">
                <a href="/mensajes">Mensajes</a>
              </Button>{' '}
              para registrarlo más rápido.
            </p>
          </div>
        </section>
      </TabsContent>
    </Tabs>
  )
}
