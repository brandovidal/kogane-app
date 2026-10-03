import type { ReactNode } from "react";
import { ChevronDown, Ellipsis } from "lucide-react";

import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";

export interface ExportMenuItem {
  label: string;
  icon?: ReactNode;
  href?: string;
  download?: boolean;
  onSelect?: () => void;
}

export function ExportMenu({
  items,
  label = "Exportar",
  iconOnly = false,
}: {
  items: ExportMenuItem[];
  label?: string;
  iconOnly?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={iconOnly ? "icon" : "sm"}
          className={iconOnly ? "size-9 rounded-xl bg-background/50" : "h-9"}
          aria-label={iconOnly ? label : undefined}
          title={iconOnly ? label : undefined}
        >
          {iconOnly ? <Ellipsis className="size-4" /> : <>{label} <ChevronDown className="size-3.5" /></>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item) =>
          item.href ? (
            <DropdownMenuItem key={item.label} asChild>
              <a href={item.href} download={item.download}>
                {item.icon}{item.label}
              </a>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={item.label} onSelect={item.onSelect}>
              {item.icon}{item.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
