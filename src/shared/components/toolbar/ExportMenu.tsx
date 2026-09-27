import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";

export interface ExportMenuItem {
  label: string;
  icon?: ReactNode;
  href?: string;
  download?: boolean;
  onSelect?: () => void;
}

export function ExportMenu({ items, label = "Exportar" }: { items: ExportMenuItem[]; label?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          {label} <ChevronDown className="h-3.5 w-3.5" />
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
