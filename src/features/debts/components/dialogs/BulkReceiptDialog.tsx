import { useState } from 'react'
import { toast } from 'sonner'

import { ATTACHMENT_MAX_MB } from '@/features/attachments/constants/attachments'
import { useUploadAttachment } from '@/features/attachments/hooks/attachments'
import { ResponsiveDialog } from '@/shared/components/dialogs/ResponsiveDialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'

// Comprobante of a bulk payment: the same file is attached to every payment that the bulk call created (refType debt_payment)
export function BulkReceiptDialog({ paymentIds, onClose }: { paymentIds: string[] | null; onClose: () => void }) {
  const upload = useUploadAttachment({ quiet: true })
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const tooBig = !!file && file.size > ATTACHMENT_MAX_MB * 1024 * 1024
  const count = paymentIds?.length ?? 0

  const attach = async () => {
    if (!file || !paymentIds) return
    setBusy(true)
    const results = await Promise.allSettled(
      paymentIds.map((refId) =>
        upload.mutateAsync({
          file,
          refType: 'debt_payment',
          refId,
          kind: 'recibo',
        }),
      ),
    )
    setBusy(false)
    const failed = results.filter((r) => r.status === 'rejected').length
    if (failed) toast.error(`${failed} de ${count} no se pudieron adjuntar`)
    else toast.success(`Comprobante adjuntado a ${count} ${count === 1 ? 'pago' : 'pagos'}`)
    if (failed < count) {
      setFile(null)
      onClose()
    }
  }

  return (
    <ResponsiveDialog
      open={!!paymentIds}
      onOpenChange={(open) => {
        if (!open) {
          setFile(null)
          onClose()
        }
      }}
      title="Adjuntar comprobante"
      description={`Se adjunta el mismo archivo a los ${count} pagos registrados.`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Omitir
          </Button>
          <Button onClick={() => void attach()} disabled={!file || tooBig || busy}>
            Adjuntar
          </Button>
        </>
      }
    >
      <div className="space-y-1.5 py-2">
        <Input type="file" aria-label="Comprobante" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <p className="text-xs text-muted-foreground">Imagen o PDF, hasta {ATTACHMENT_MAX_MB} MB.</p>
        {tooBig && <p className="text-xs text-destructive">El archivo supera el límite.</p>}
      </div>
    </ResponsiveDialog>
  )
}
