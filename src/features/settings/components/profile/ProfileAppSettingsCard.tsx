import { ArrowRight, Settings2 } from 'lucide-react'
import { Button } from '@/ui/button'
import { CardContent } from '@/ui/card'
import { ProfileAccentCard, ProfileAccentHeader } from './ProfileAccentCard'

export function ProfileAppSettingsCard() {
  return (
    <ProfileAccentCard tone="app">
      <ProfileAccentHeader
        tone="app"
        icon={Settings2}
        title="Ajustes de la app"
        description="Tema, moneda predeterminada, zona horaria y avisos ya no viven en tu perfil: son de la app."
      />
      <CardContent className="px-5 pt-0 pb-5">
        <Button type="button" variant="outline" size="sm" asChild>
          <a href="/configuracion/general">
            Ir a Configuración <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        </Button>
      </CardContent>
    </ProfileAccentCard>
  )
}
