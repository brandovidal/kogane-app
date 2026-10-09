"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";

import { cn } from "@/shared/utils/cn";

const ComboboxPortalContext = React.createContext<{
  container: HTMLElement | null;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
} | null>(null);

function Combobox<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
>(props: ComboboxPrimitive.Root.Props<Value, Multiple, Item>) {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const portal = React.useMemo(() => ({ container, triggerRef }), [container]);

  return (
    <ComboboxPortalContext.Provider value={portal}>
      <ComboboxPrimitive.Root
        {...props}
        onOpenChange={(open, details) => {
          // Resolve when opening: a trigger's mount ref can run before its portal
          // has been inserted into the sheet/dialog's DOM tree.
          if (open) {
            setContainer(
              triggerRef.current?.closest<HTMLElement>(
                '[role="dialog"], [role="alertdialog"]',
              ) ?? null,
            );
          }
          props.onOpenChange?.(open, details);
        }}
      />
    </ComboboxPortalContext.Provider>
  );
}

const createComboboxItems = ComboboxPrimitive.createItems;
const ComboboxValue = ComboboxPrimitive.Value;
const ComboboxItemIndicator = ComboboxPrimitive.ItemIndicator;
const ComboboxGroup = ComboboxPrimitive.Group;
const ComboboxGroupLabel = ComboboxPrimitive.GroupLabel;
const ComboboxCollection = ComboboxPrimitive.Collection;
const ComboboxSeparator = ComboboxPrimitive.Separator;

const ComboboxList = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ComboboxPrimitive.List>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.List
    ref={ref}
    className={cn("min-h-0 overflow-y-auto overscroll-contain", className)}
    {...props}
  />
));
ComboboxList.displayName = "ComboboxList";

const ComboboxEmpty = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ComboboxPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Empty
    ref={ref}
    className={cn("group-not-data-[empty]/combobox-content:p-0", className)}
    {...props}
  />
));
ComboboxEmpty.displayName = "ComboboxEmpty";

const ComboboxTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof ComboboxPrimitive.Trigger>
>(({ className, type = "button", ...props }, ref) => {
  const triggerRef = React.useContext(ComboboxPortalContext)?.triggerRef;
  const registerTrigger = React.useCallback(
    (element: HTMLButtonElement | null) => {
      if (triggerRef) triggerRef.current = element;
      if (typeof ref === "function") ref(element);
      else if (ref) ref.current = element;
    },
    [ref, triggerRef],
  );

  return (
    <ComboboxPrimitive.Trigger
      ref={registerTrigger}
      type={type}
      data-slot="combobox-trigger"
      className={cn(
        "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
});
ComboboxTrigger.displayName = "ComboboxTrigger";

const ComboboxContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ComboboxPrimitive.Popup> & {
    sideOffset?: number;
    container?: React.ComponentProps<
      typeof ComboboxPrimitive.Portal
    >["container"];
  }
>(({ className, sideOffset = 4, container, ...props }, ref) => {
  const portal = React.useContext(ComboboxPortalContext);

  return (
    <ComboboxPrimitive.Portal
      container={
        container === undefined ? (portal?.container ?? undefined) : container
      }
    >
      <ComboboxPrimitive.Positioner
        positionMethod="fixed"
        sideOffset={sideOffset}
        className="pointer-events-auto z-50"
      >
        <ComboboxPrimitive.Popup
          ref={ref}
          data-slot="combobox-content"
          className={cn(
            "group/combobox-content flex max-h-[var(--available-height)] w-[var(--anchor-width)] min-w-40 flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
});
ComboboxContent.displayName = "ComboboxContent";

const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof ComboboxPrimitive.Input>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Input
    ref={ref}
    data-slot="combobox-input"
    className={cn(
      "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
      className,
    )}
    {...props}
  />
));
ComboboxInput.displayName = "ComboboxInput";

const ComboboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ComboboxPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Item
    ref={ref}
    data-slot="combobox-item"
    className={cn(
      "group flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  />
));
ComboboxItem.displayName = "ComboboxItem";

export {
  Combobox,
  createComboboxItems,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxCollection,
  ComboboxSeparator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
};
