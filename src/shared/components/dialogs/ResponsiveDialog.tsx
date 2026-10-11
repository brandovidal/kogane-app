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
  headerActions?: ReactNode;
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
  headerActions,
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
          <DialogHeader
            className={cn(
              headerActions &&
                "flex-row items-start justify-between pr-8 text-left",
            )}
          >
            <div className="min-w-0 space-y-2">
              <DialogTitle className={cn(icon && "flex items-center gap-2")}>
                {icon}
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </div>
            {headerActions}
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
        <SheetHeader
          className={cn(
            headerActions &&
              "flex-row items-start justify-between pr-8 text-left",
          )}
        >
          <div className="min-w-0 space-y-1.5">
            <SheetTitle className={cn(icon && "flex items-center gap-2")}>
              {icon}
              {title}
            </SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </div>
          {headerActions}
        </SheetHeader>
        <div className="px-4">{children}</div>
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
