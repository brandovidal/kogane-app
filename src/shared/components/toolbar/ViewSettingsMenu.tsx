import type { ReactElement, ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";

export interface ViewSettingsMenuProps {
  trigger: ReactElement;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

export function ViewSettingsMenu({
  trigger,
  children,
  open,
  onOpenChange,
  title = "Ajustes de vista",
  align = "end",
  sideOffset = 8,
  className = "max-h-[min(80vh,42rem)] w-80 overflow-y-auto rounded-xl border-border/80 bg-popover p-1.5 shadow-xl",
}: ViewSettingsMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={sideOffset}
        className={className}
      >
        <DropdownMenuLabel className="px-2.5 pb-2 text-sm font-semibold">
          {title}
        </DropdownMenuLabel>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
