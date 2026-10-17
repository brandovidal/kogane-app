import { AppearanceSection } from "../sections/general/AppearanceSection";
import { BudgetSection } from "../sections/general/BudgetSection";
import { RegionSection } from "../sections/general/RegionSection";
import "../styles/settings.css";

export function GeneralSettingsView() {
  return (
    <div className="settings-general-view">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">General</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Cómo se ve y cómo calcula Kogane para ti. Lo personal (nombre, documento, contraseña) está en tu Perfil.
        </p>
      </header>
      <AppearanceSection />
      <RegionSection />
      <BudgetSection />
    </div>
  );
}
