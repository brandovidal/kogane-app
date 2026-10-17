import { cn } from "@/shared/utils/cn";
import { CARDS_ACCOUNTS_TABS, type CardsAccountsTab } from "../constants/sections";

// Subtabs of Cuentas y tarjetas; each one is its own route (/configuracion/cuentas-tarjetas/<tab>)
export function CardsAccountsTabs({ active }: { active: CardsAccountsTab }) {
  return (
    <div role="tablist" aria-label="Cuentas y tarjetas" className="flex gap-1 border-b">
      {CARDS_ACCOUNTS_TABS.map(({ key, label, href }) => (
        <a
          key={key}
          role="tab"
          href={href}
          aria-selected={key === active}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
            key === active ? "border-primary text-foreground" : "border-transparent",
          )}
        >
          {label}
        </a>
      ))}
    </div>
  );
}
