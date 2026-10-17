import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { useChangePassword, type useMe } from '@/features/auth/hooks/auth'
import { PasswordInput } from '@/shared/components/forms/PasswordInput'
import { Button } from '@/ui/button'
import { CardContent } from '@/ui/card'
import { ProfileAccentCard, ProfileAccentHeader } from './ProfileAccentCard'

export function ProfilePasswordCard({ user }: { user: NonNullable<ReturnType<typeof useMe>['data']> }) {
  const changePassword = useChangePassword()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const valid = next.length >= 10 && (!user.hasPassword || !!current)

  return (
    <ProfileAccentCard tone="password">
      <ProfileAccentHeader
        tone="password"
        icon={KeyRound}
        title="Contraseña"
        description={`${user.hasPassword ? 'Cámbiala cuando quieras.' : 'Define una para entrar sin Google.'} Mínimo 10 caracteres.`}
      />
      <CardContent className="space-y-3 px-5 pt-0 pb-5">
        {user.hasPassword && (
          <PasswordInput
            aria-label="Contraseña actual"
            placeholder="Contraseña actual"
            autoComplete="current-password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
          />
        )}
        <PasswordInput
          aria-label="Contraseña nueva"
          placeholder="Contraseña nueva"
          autoComplete="new-password"
          minLength={10}
          value={next}
          onChange={(event) => setNext(event.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={!valid || changePassword.isPending}
          onClick={() => changePassword.mutate({ current: current || undefined, next }, { onSuccess: () => (setCurrent(''), setNext('')) })}
        >
          <KeyRound aria-hidden="true" className="size-4" />
          {changePassword.isPending ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
        {user.hasPassword && (
          <details className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
            <summary className="cursor-pointer font-medium">¿Olvidaste tu contraseña actual?</summary>
            <p className="mt-2 leading-5 text-muted-foreground">
              Pídele al administrador una nueva invitación para el correo de esta cuenta. Al abrirla podrás definir otra contraseña; Kogane no envía
              enlaces de recuperación automáticamente.
            </p>
          </details>
        )}
      </CardContent>
    </ProfileAccentCard>
  )
}
