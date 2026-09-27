"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/shared/utils/cn";

const PopoverPortalContext = React.createContext<{
  container: HTMLElement | null;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
} | null>(null);

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const portal = React.useMemo(() => ({ container, triggerRef }), [container]);

  return (
    <PopoverPortalContext.Provider value={portal}>
      <PopoverPrimitive.Root
        {...props}
        onOpenChange={(open, details) => {
          // Keep the popup inside the enclosing modal's pointer and focus scope.
          if (open)
            setContainer(
              triggerRef.current?.closest<HTMLElement>(
                '[role="dialog"], [role="alertdialog"]',
              ) ?? null,
            );
          props.onOpenChange?.(open, details);
        }}
      />
    </PopoverPortalContext.Provider>
  );
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof PopoverPrimitive.Trigger>
>((props, ref) => {
  const triggerRef = React.useContext(PopoverPortalContext)?.triggerRef;
  const registerTrigger = React.useCallback(
    (element: HTMLButtonElement | null) => {
      if (triggerRef) triggerRef.current = element;
      if (typeof ref === "function") ref(element);
      else if (ref) ref.current = element;
    },
    [ref, triggerRef],
  );
  return <PopoverPrimitive.Trigger {...props} ref={registerTrigger} />;
});
PopoverTrigger.displayName = "PopoverTrigger";

function PopoverContent({
  className,
  sideOffset = 4,
  align = "start",
  container,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> & {
  sideOffset?: number;
  align?: "start" | "center" | "end";
  container?: React.ComponentProps<typeof PopoverPrimitive.Portal>["container"];
}) {
  const portal = React.useContext(PopoverPortalContext);
  return (
    <PopoverPrimitive.Portal
      container={
        container === undefined ? (portal?.container ?? undefined) : container
      }
    >
      <PopoverPrimitive.Positioner
        positionMethod="fixed"
        sideOffset={sideOffset}
        align={align}
        className="pointer-events-auto z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "max-h-[var(--available-height)] overflow-y-auto rounded-md border bg-popover p-3 text-popover-foreground shadow-md outline-none",
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
