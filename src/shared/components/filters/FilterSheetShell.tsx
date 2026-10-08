import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/ui/sheet";
import { cn } from "@/shared/utils/cn";

interface FilterSheetShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  trigger?: ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

export function FilterSheetShell({
  open,
  onOpenChange,
  header,
  children,
  footer,
  trigger,
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
}: FilterSheetShellProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side="right"
        className={cn(
          "flex w-[min(24rem,calc(100vw-1rem))] flex-col overflow-hidden",
          contentClassName,
        )}
      >
        <SheetHeader className={headerClassName}>{header}</SheetHeader>
        <div className={cn("min-h-0 flex-1 overflow-y-auto", bodyClassName)}>
          {children}
        </div>
        {footer != null && (
          <SheetFooter className={footerClassName}>{footer}</SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
