import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import { useIsDesktop } from "@/shared/hooks/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/ui/sheet";

export interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
  overlayClassName?: string;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  icon,
  description,
  children,
  footer,
  contentClassName,
  overlayClassName,
}: ResponsiveDialogProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "sm:max-w-lg max-h-[90vh] overflow-y-auto",
            contentClassName,
          )}
          overlayClassName={overlayClassName}
        >
          <DialogHeader>
            <DialogTitle className={cn(icon && "flex items-center gap-2")}>
              {icon}
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "max-h-[85vh] overflow-y-auto rounded-t-lg",
          contentClassName,
        )}
      >
        <SheetHeader>
          <SheetTitle className={cn(icon && "flex items-center gap-2")}>
            {icon}
            {title}
          </SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="px-4">{children}</div>
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
