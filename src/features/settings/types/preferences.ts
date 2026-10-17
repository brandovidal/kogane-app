export type SettingsCurrency = "PEN" | "USD";

export type SettingsTimeZone = "America/Lima" | "America/Bogota" | "America/Santiago" | "America/Mexico_City" | "UTC";

export interface SettingsPreferences {
  currency: SettingsCurrency;
  timeZone: SettingsTimeZone;
}
