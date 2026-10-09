import { SETTINGS_MENU_LINKS } from "../constants/menu";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/ui/dropdown-menu";

// Links of the user menu: the settings of everyone, then the administration block (header board 13)
export function SettingsMenuItems({ isAdmin }: { isAdmin: boolean }) {
  const general = SETTINGS_MENU_LINKS.filter((link) => !link.adminOnly);
  const admin = isAdmin
    ? SETTINGS_MENU_LINKS.filter((link) => link.adminOnly)
    : [];

  return (
    <>
      {general.map(({ href, label, icon: Icon }) => (
        <DropdownMenuItem key={href} asChild className="min-h-9">
          <a href={href}>
            <Icon aria-hidden="true" />
            {label}
          </a>
        </DropdownMenuItem>
      ))}
      {admin.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="px-2 pt-1 pb-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Administración
          </DropdownMenuLabel>
          {admin.map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem key={href} asChild className="min-h-9">
              <a href={href}>
                <Icon aria-hidden="true" />
                {label}
                <span className="ml-auto text-xs text-muted-foreground">
                  Admin
                </span>
              </a>
            </DropdownMenuItem>
          ))}
        </>
      )}
    </>
  );
}
