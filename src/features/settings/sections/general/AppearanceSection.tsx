import { useEffect } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { THEME_OPTIONS } from '@/shared/constants/theme'
import { useThemeStore } from '@/shared/hooks/useTheme'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import type { ThemePreference } from '@/shared/types/theme'

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor }

export function AppearanceSection() {
  const preference = useThemeStore((state) => state.preference)
  const setTheme = useThemeStore((state) => state.setTheme)
  const initTheme = useThemeStore((state) => state.initTheme)

  useEffect(() => initTheme(), [initTheme])

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Apariencia</CardTitle>
        <CardDescription>Elige Claro, Oscuro o que siga a tu dispositivo.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="settings-theme-options" role="group" aria-label="Apariencia">
          {THEME_OPTIONS.map((option) => {
            const Icon = THEME_ICONS[option.value]
            const selected = preference === option.value
            return (
              <Button
                key={option.value}
                type="button"
                variant="ghost"
                aria-pressed={selected}
                className="settings-theme-option"
                data-selected={selected}
                onClick={() => setTheme(option.value as ThemePreference)}
              >
                <Icon aria-hidden="true" className="size-4" />
                {option.label}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
