import { useSettingsPreferences } from '../../hooks/useSettingsPreferences'
import { SETTINGS_TIME_ZONES } from '../../constants/preferences'
import { CURRENCY_OPTIONS } from '@/shared/constants/currency'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'

export function RegionSection() {
  const { currency, timeZone, setCurrency, setTimeZone } = useSettingsPreferences()
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Región</CardTitle>
        <CardDescription>Define en qué moneda se muestran los totales y cuándo cambia el día para los avisos.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <label className="text-sm font-medium" htmlFor="settings-default-currency">
            Moneda predeterminada
          </label>
          <Select value={currency} onValueChange={(value) => value && setCurrency(value as 'PEN' | 'USD')}>
            <SelectTrigger id="settings-default-currency" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value === 'PEN' ? 'S/ · Soles peruanos (PEN)' : '$ · Dólares estadounidenses (USD)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs leading-relaxed text-muted-foreground">Se usa al registrar un gasto sin moneda. Los dólares se convierten a esta.</p>
        </div>
        <div className="min-w-0 space-y-2">
          <label className="text-sm font-medium" htmlFor="settings-time-zone">
            Zona horaria
          </label>
          <Select value={timeZone} onValueChange={(value) => value && setTimeZone(value as (typeof SETTINGS_TIME_ZONES)[number]['value'])}>
            <SelectTrigger id="settings-time-zone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SETTINGS_TIME_ZONES.map((zone) => (
                <SelectItem key={zone.value} value={zone.value}>
                  {zone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs leading-relaxed text-muted-foreground">Los recordatorios salen a esta hora local.</p>
        </div>
      </CardContent>
    </Card>
  )
}
