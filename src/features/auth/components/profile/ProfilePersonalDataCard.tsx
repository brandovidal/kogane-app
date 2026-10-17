import { useState, type SubmitEvent } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import type { useMe } from '@/features/auth/hooks/auth'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'

export interface ProfileDraft {
  name: string
  nickname: string
  phone: string
  documentNumber: string
  clearDocument: boolean
}

export interface ProfileFieldErrors {
  name?: string
  phone?: string
  documentNumber?: string
}

export function validateProfileDraft(draft: ProfileDraft): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {}
  if (!draft.name.trim()) errors.name = 'Escribe tu nombre completo.'
  if (draft.phone && !/^9\d{8}$/.test(draft.phone)) {
    errors.phone = 'Ingresa 9 dígitos que empiecen con 9.'
  }
  if (draft.documentNumber && !/^\d{8}$/.test(draft.documentNumber)) {
    const remaining = Math.max(8 - draft.documentNumber.length, 0)
    errors.documentNumber = remaining > 0 ? `El DNI tiene 8 dígitos. Faltan ${remaining}.` : 'El DNI debe tener 8 dígitos.'
  }
  return errors
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null
  return (
    <p id={id} className="text-xs text-destructive" role="alert">
      {children}
    </p>
  )
}

export function ProfilePersonalDataCard({
  user,
  draft,
  errors,
  hasChanges,
  changeCount,
  pending,
  savedRecently,
  onChange,
  onDiscard,
  onSubmit,
}: {
  user: NonNullable<ReturnType<typeof useMe>['data']>
  draft: ProfileDraft
  errors: ProfileFieldErrors
  hasChanges: boolean
  changeCount: number
  pending: boolean
  savedRecently: boolean
  onChange: (next: ProfileDraft) => void
  onDiscard: () => void
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
}) {
  const [documentVisible, setDocumentVisible] = useState(false)
  const documentErrorId = 'profile-document-error'
  const phoneErrorId = 'profile-phone-error'
  const nameErrorId = 'profile-name-error'

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Datos personales</CardTitle>
        <CardDescription>Con estos datos te identifica Kogane en repartos, cobros y estados de cuenta.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="profile-personal-form" className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="text-sm font-medium">
                Nombre completo
              </label>
              <Input
                id="profile-name"
                autoComplete="name"
                value={draft.name}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? nameErrorId : undefined}
                onChange={(event) => onChange({ ...draft, name: event.target.value })}
              />
              <FieldError id={nameErrorId}>{errors.name}</FieldError>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-nickname" className="text-sm font-medium">
                Apodo
              </label>
              <Input id="profile-nickname" value={draft.nickname} onChange={(event) => onChange({ ...draft, nickname: event.target.value })} />
              <p className="text-xs text-muted-foreground">Así te nombra el bot y apareces en los repartos.</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-document" className="text-sm font-medium">
                Documento
              </label>
              <div className="relative flex h-10 overflow-hidden rounded-lg border border-input bg-muted/40 focus-within:ring-2 focus-within:ring-ring">
                <span className="inline-flex shrink-0 items-center border-r border-input px-3 text-sm text-muted-foreground">DNI</span>
                <Input
                  id="profile-document"
                  type={documentVisible ? 'text' : 'password'}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={8}
                  placeholder={draft.clearDocument ? 'Se quitará el DNI' : user.documentMasked ? `Guardado ${user.documentMasked}` : '8 dígitos'}
                  value={draft.documentNumber}
                  aria-invalid={!!errors.documentNumber}
                  aria-describedby={errors.documentNumber ? documentErrorId : undefined}
                  className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent pr-10 focus-visible:ring-0"
                  onChange={(event) =>
                    onChange({
                      ...draft,
                      documentNumber: event.target.value.replace(/\D/g, ''),
                      clearDocument: false,
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={documentVisible ? 'Ocultar DNI' : 'Mostrar DNI'}
                  aria-pressed={documentVisible}
                  onClick={() => setDocumentVisible((visible) => !visible)}
                >
                  {documentVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              <FieldError id={documentErrorId}>{errors.documentNumber}</FieldError>
              {user.documentMasked && !draft.documentNumber && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline underline-offset-2"
                  onClick={() =>
                    onChange({
                      ...draft,
                      clearDocument: !draft.clearDocument,
                    })
                  }
                >
                  {draft.clearDocument ? 'Conservar DNI' : 'Quitar DNI'}
                </button>
              )}
              <p className="text-xs text-muted-foreground">
                Abre tus estados de cuenta en PDF y se copia a tu persona «Yo». Se guarda completo y se muestra oculto.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-phone" className="text-sm font-medium">
                Celular
              </label>
              <div className="flex h-10 overflow-hidden rounded-lg border border-input bg-muted/40 focus-within:ring-2 focus-within:ring-ring">
                <span className="inline-flex shrink-0 items-center border-r border-input px-3 text-sm text-muted-foreground">+51</span>
                <Input
                  id="profile-phone"
                  inputMode="tel"
                  autoComplete="tel-national"
                  maxLength={9}
                  value={draft.phone}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? phoneErrorId : undefined}
                  className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent focus-visible:ring-0"
                  onChange={(event) =>
                    onChange({
                      ...draft,
                      phone: event.target.value.replace(/\D/g, ''),
                    })
                  }
                />
              </div>
              <FieldError id={phoneErrorId}>{errors.phone}</FieldError>
              <p className="text-xs text-muted-foreground">También sirve para entrar a Kogane.</p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="profile-email" className="text-sm font-medium">
                Correo
              </label>
              <div className="relative">
                <Input id="profile-email" value={user.email} readOnly aria-readonly="true" className="pr-10 text-muted-foreground" />
                <LockKeyhole aria-hidden="true" className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Lo definió tu invitación. Si necesitas otro, pídeselo a quien administra Kogane.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {hasChanges ? 'Hay cambios sin guardar' : savedRecently ? 'Guardado hace un momento' : 'Sin cambios'}
            </p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" disabled={!hasChanges || pending} onClick={onDiscard}>
                Descartar
              </Button>
              <Button type="submit" form="profile-personal-form" disabled={!hasChanges || Object.keys(errors).length > 0 || pending}>
                Guardar cambios
              </Button>
            </div>
          </div>
          {hasChanges && <span className="sr-only">{changeCount} cambios sin guardar.</span>}
        </form>
      </CardContent>
    </Card>
  )
}
