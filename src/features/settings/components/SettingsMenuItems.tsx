import { SETTINGS_MENU_LINKS } from "../constants/menu";
import { DropdownMenuItem } from "@/ui/dropdown-menu";

export function SettingsMenuItems({ isAdmin }: { isAdmin: boolean }) {
  return SETTINGS_MENU_LINKS.filter((link) => !link.adminOnly || isAdmin).map(
    ({ href, label, icon: Icon }) => (
      <DropdownMenuItem key={href} asChild className="min-h-9">
        <a href={href}>
          <Icon aria-hidden="true" />
          {label}
        </a>
      </DropdownMenuItem>
    ),
  );
}
