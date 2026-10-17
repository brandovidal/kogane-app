import { useQuery } from '@tanstack/react-query'
import { MessageSquareText } from 'lucide-react'

import { getDraft } from '@/features/drafts/services/draft.service'
import { ResponsiveDialog } from '@/shared/components/dialogs/ResponsiveDialog'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'

const CHANNELS: Record<string, string> = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  web: 'Web',
}
const INPUTS: Record<string, string> = {
  text: 'Texto',
  image: 'Captura',
  audio: 'Nota de voz',
  manual: 'Formulario',
}

interface OriginMessageDialogProps {
  draftId: string
  title: string
  onClose: () => void
}

// The message a saved expense came from (the draft keeps the raw text / screenshot / voice note)
export function OriginMessageDialog({ draftId, title, onClose }: OriginMessageDialogProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['drafts', 'origin', draftId],
    queryFn: () => getDraft(draftId),
  })

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Mensaje de origen"
      icon={<MessageSquareText className="h-4 w-4" />}
      description={title}
    >
      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : isError || !data ? (
        <p className="text-sm text-muted-foreground">No se pudo cargar el mensaje de origen.</p>
      ) : (
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-xs text-muted-foreground">
            {CHANNELS[data.channel] ?? data.channel} · {INPUTS[data.inputType] ?? data.inputType}
          </p>
          {data.rawText ? (
            <blockquote className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3">{data.rawText}</blockquote>
          ) : (
            <p className="text-muted-foreground">El mensaje no tiene texto.</p>
          )}
          {data.mediaUrl && (
            <Button variant="outline" size="sm" className="self-start" asChild>
              <a href={data.mediaUrl} target="_blank" rel="noopener noreferrer">
                Abrir archivo adjunto
              </a>
            </Button>
          )}
        </div>
      )}
    </ResponsiveDialog>
  )
}
