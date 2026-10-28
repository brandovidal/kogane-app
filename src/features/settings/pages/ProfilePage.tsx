import { useEffect, useState, type SubmitEvent } from 'react'
import { toast } from 'sonner'

import { googleLinkUrl } from '@/features/auth/services/google.service'
import { useAuthConfig, useMe, useUpdateProfile } from '@/features/auth/hooks/auth'
import { errorMessage } from '@/shared/api/hooks/use-api-mutation'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'
import { ProfileAccountCard } from '../components/profile/ProfileAccountCard'
import { ProfileAppSettingsCard } from '../components/profile/ProfileAppSettingsCard'
import { ProfilePersonalDataCard, type ProfileDraft, validateProfileDraft } from '../components/profile/ProfilePersonalDataCard'
import { ProfilePasswordCard } from '../components/profile/ProfilePasswordCard'
import { ProfileTelegramCard } from '../components/profile/ProfileTelegramCard'

function makeDraft(user: NonNullable<ReturnType<typeof useMe>['data']>): ProfileDraft {
  return {
    name: user.name,
    nickname: user.nickname ?? '',
    phone: user.phone ?? '',
    documentNumber: '',
    clearDocument: false,
  }
}

function changedFields(draft: ProfileDraft, saved: ProfileDraft) {
  return [
    draft.name.trim() !== saved.name.trim(),
    draft.nickname.trim() !== saved.nickname.trim(),
    draft.phone !== saved.phone,
    draft.documentNumber !== saved.documentNumber || draft.clearDocument !== saved.clearDocument,
  ].filter(Boolean).length
}

function ProfilePageView() {
  const { data: me } = useMe()
  const authConfig = useAuthConfig().data
  const update = useUpdateProfile()
  const [hasHydrated, setHasHydrated] = useState(false)
  const [draft, setDraft] = useState<ProfileDraft>(() =>
    me
      ? makeDraft(me)
      : {
          name: '',
          nickname: '',
          phone: '',
          documentNumber: '',
          clearDocument: false,
        },
  )
  const [savedDraft, setSavedDraft] = useState(draft)
  const [savedRecently, setSavedRecently] = useState(false)
  const [linkingGoogle, setLinkingGoogle] = useState(false)
  const [googleNotice, setGoogleNotice] = useState<{
    kind: 'success' | 'error'
    text: string
  } | null>(null)
  const userId = me?.id
  const userName = me?.name
  const userNickname = me?.nickname
  const userPhone = me?.phone
  const userDocumentMasked = me?.documentMasked

  useEffect(() => setHasHydrated(true), [])

  useEffect(() => {
    if (!userId || !userName) return
    const next: ProfileDraft = {
      name: userName,
      nickname: userNickname ?? '',
      phone: userPhone ?? '',
      documentNumber: '',
      clearDocument: false,
    }
    setDraft(next)
    setSavedDraft(next)
  }, [userId, userName, userNickname, userPhone, userDocumentMasked])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const result = params.get('google')
    const failure = params.get('google_error')
    if (result === 'linked')
      setGoogleNotice({
        kind: 'success',
        text: 'Google quedó vinculado a tu cuenta.',
      })
    if (failure) {
      const messages: Record<string, string> = {
        cancelled: 'Se canceló la vinculación de Google.',
        email: 'El correo de Google debe ser el mismo de tu cuenta de Kogane.',
        linked: 'Esa cuenta de Google ya está vinculada a otra cuenta de Kogane.',
        session: 'Tu sesión venció. Vuelve a iniciar sesión e inténtalo de nuevo.',
      }
      setGoogleNotice({
        kind: 'error',
        text: messages[failure] ?? 'No se pudo vincular Google.',
      })
    }
    if (result || failure) window.history.replaceState(null, '', window.location.pathname)
  }, [])

  if (!hasHydrated) {
    return (
      <div className="w-full space-y-4" aria-busy="true" aria-label="Cargando perfil">
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.9fr)]">
          <div className="space-y-4">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    )
  }
  if (!me) return null

  const errors = validateProfileDraft(draft)
  const changeCount = changedFields(draft, savedDraft)
  const hasChanges = changeCount > 0
  const canSave = hasChanges && Object.keys(errors).length === 0
  const errorCount = Object.keys(errors).length

  const discardChanges = () => {
    setDraft({ ...savedDraft, documentNumber: '', clearDocument: false })
    setSavedRecently(false)
  }

  const saveProfile = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSave || update.isPending) return
    update.mutate(
      {
        name: draft.name.trim(),
        nickname: draft.nickname.trim() || null,
        phone: draft.phone.trim() || null,
        ...(draft.documentNumber.trim() ? { documentNumber: draft.documentNumber.trim() } : draft.clearDocument ? { documentNumber: null } : {}),
      },
      {
        onSuccess: () => {
          const next = { ...draft, documentNumber: '', clearDocument: false }
          setDraft(next)
          setSavedDraft(next)
          setSavedRecently(true)
          toast.success('Datos guardados', {
            description: 'Tu perfil y tu persona «Yo» ya están al día.',
          })
        },
      },
    )
  }

  const startGoogleLink = async () => {
    setLinkingGoogle(true)
    try {
      window.location.assign(await googleLinkUrl())
    } catch (error) {
      setGoogleNotice({ kind: 'error', text: errorMessage(error) })
      setLinkingGoogle(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.9fr)]">
        <div className="min-w-0 space-y-4">
          <ProfilePersonalDataCard
            user={me}
            draft={draft}
            errors={errors}
            hasChanges={hasChanges}
            changeCount={changeCount}
            pending={update.isPending}
            savedRecently={savedRecently}
            onChange={(next) => {
              setDraft(next)
              setSavedRecently(false)
            }}
            onDiscard={discardChanges}
            onSubmit={saveProfile}
          />
          <ProfileAppSettingsCard />
        </div>

        <div className="min-w-0 space-y-4">
          <ProfileAccountCard
            user={me}
            googleEnabled={!!authConfig?.google}
            linkingGoogle={linkingGoogle}
            googleNotice={googleNotice}
            onLinkGoogle={startGoogleLink}
          />
          <ProfilePasswordCard user={me} />
          <ProfileTelegramCard user={me} />
        </div>
      </div>

      {hasChanges && (
        <div
          role="status"
          aria-live="polite"
          className={`sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur ${errorCount ? 'border-destructive/50' : 'border-primary/40'}`}
        >
          <p className="flex items-center gap-2 text-sm">
            <span aria-hidden="true" className={`size-2 rounded-full ${errorCount ? 'bg-destructive' : 'bg-amber-400'}`} />
            {errorCount
              ? `Corrige ${errorCount} ${errorCount === 1 ? 'campo' : 'campos'} para guardar`
              : `Tienes ${changeCount} ${changeCount === 1 ? 'cambio' : 'cambios'} sin guardar`}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={discardChanges} disabled={update.isPending}>
              Descartar
            </Button>
            <Button type="submit" form="profile-personal-form" disabled={!canSave || update.isPending}>
              {update.isPending ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export const ProfilePage = ProfilePageView
